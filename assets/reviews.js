import { getSupabaseClient } from './supabase-client.js'

function getBasePath() {
  const { pathname, hostname } = window.location
  if (hostname === 'localhost' || hostname === '127.0.0.1') return ''
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length <= 1) return ''
  return `/${segments[0]}`
}

function withBase(path) {
  const cleanPath = `/${String(path || '').replace(/^\/+/, '')}`
  return `${getBasePath()}${cleanPath}`
}

function normalize(value) {
  return String(value || '').trim()
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatTargetType(value) {
  return value === 'doctor' ? '医生' : value === 'clinic' ? '诊所' : '未知'
}

function formatChannelType(value) {
  if (value === 'doctor') return '医生打孔'
  if (value === 'team') return '团队打孔'
  if (value === 'unknown') return '未说明'
  return '未说明'
}

function formatDisplayName(targetType, item) {
  const nameZh = normalize(item.name_zh)
  const nameEn = normalize(item.name_en)

  if (targetType === 'doctor') {
    if (nameEn && nameZh) return `Dr. ${nameEn}（${nameZh}）`
    if (nameEn) return `Dr. ${nameEn}`
    return nameZh || '未命名医生'
  }

  if (nameZh && nameEn && nameZh !== nameEn) return `${nameZh}（${nameEn}）`
  return nameZh || nameEn || '未命名机构'
}

function formatDateTime(value) {
  if (!value) return '未知时间'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '未知时间'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

async function loadTargets() {
  const [doctorsResponse, clinicsResponse] = await Promise.all([
    fetch(withBase('/data/doctors.json')),
    fetch(withBase('/data/clinics.json')),
  ])

  if (!doctorsResponse.ok || !clinicsResponse.ok) {
    throw new Error('医生或诊所数据加载失败')
  }

  const doctors = await doctorsResponse.json()
  const clinics = await clinicsResponse.json()

  return {
    doctor: doctors.map((item) => ({
      id: normalize(item.doctor_id),
      name: normalize(item.name_zh || item.doctor_name_cn || item.doctor_name_en),
      name_en: normalize(item.name_en || item.doctor_name_en),
      name_zh: normalize(item.name_zh || item.doctor_name_cn || item.doctor_name_en),
      displayName: formatDisplayName('doctor', item),
    })),
    clinic: clinics.map((item) => ({
      id: normalize(item.clinic_id),
      name: normalize(item.name_zh || item.clinic_name || item.official_name),
      name_en: normalize(item.name_en || item.clinic_name || item.official_name),
      name_zh: normalize(item.name_zh || item.clinic_name || item.official_name),
      displayName: formatDisplayName('clinic', item),
    })),
  }
}

function findTargetByName(targets, name) {
  const normalizedName = normalize(name)
  return (
    targets.find(
      (item) =>
        normalize(item.displayName) === normalizedName ||
        normalize(item.name) === normalizedName ||
        normalize(item.name_zh) === normalizedName ||
        normalize(item.name_en) === normalizedName,
    ) || null
  )
}

function renderTargetOptions(datalist, targets) {
  datalist.innerHTML = targets
    .map((item) => `<option value="${escapeHtml(item.displayName)}"></option>`)
    .join('')
}

function setMessage(container, type, text) {
  if (!container) return
  if (!text) {
    container.className = 'review-message'
    container.textContent = ''
    return
  }
  container.className = `review-message review-message-${type}`
  container.textContent = text
}

async function setupSubmitReview() {
  const root = document.getElementById('submit-review-app')
  if (!root) return

  const form = document.getElementById('review-form')
  const targetTypeSelect = document.getElementById('target-type')
  const targetNameInput = document.getElementById('target-name')
  const targetNameList = document.getElementById('target-name-options')
  const graftCountInput = document.getElementById('graft-count')
  const channelField = document.getElementById('channel-field')
  const channelSelect = document.getElementById('channel-opening-type')
  const priceInput = document.getElementById('price-eur')
  const commentInput = document.getElementById('comment')
  const message = document.getElementById('review-submit-message')
  const submitButton = document.getElementById('review-submit-button')
  const successActions = document.getElementById('review-success-actions')

  let targetsByType = { doctor: [], clinic: [] }

  const syncTargetOptions = () => {
    const currentType = targetTypeSelect.value
    const targets = targetsByType[currentType] || []
    renderTargetOptions(targetNameList, targets)
    targetNameInput.value = ''
    if (currentType === 'doctor') {
      channelField.hidden = true
      channelSelect.value = 'doctor'
    } else {
      channelField.hidden = false
      if (!normalize(channelSelect.value)) channelSelect.value = 'unknown'
    }
  }

  try {
    targetsByType = await loadTargets()
    syncTargetOptions()
  } catch (error) {
    console.error(error)
    setMessage(message, 'error', '目标数据加载失败，请稍后再试。')
    form.querySelectorAll('input, select, textarea, button').forEach((element) => {
      element.disabled = true
    })
    return
  }

  targetTypeSelect.addEventListener('change', syncTargetOptions)

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    setMessage(message, 'info', '')
    if (successActions) successActions.hidden = true

    const targetType = targetTypeSelect.value
    const targets = targetsByType[targetType] || []
    const selectedTarget = findTargetByName(targets, targetNameInput.value)
    const graftCount = Number(graftCountInput.value)
    const priceEur = Number(priceInput.value)
    const comment = normalize(commentInput.value)
    const channelOpeningType = targetType === 'doctor' ? 'doctor' : channelSelect.value

    if (!selectedTarget) {
      setMessage(message, 'error', '请选择有效的医生或诊所名称。')
      return
    }

    if (!Number.isFinite(graftCount) || graftCount <= 0) {
      setMessage(message, 'error', '移植单位数量必须大于 0。')
      graftCountInput.focus()
      return
    }

    if (!Number.isFinite(priceEur) || priceEur <= 0) {
      setMessage(message, 'error', '价格必须大于 0。')
      priceInput.focus()
      return
    }

    if (!comment) {
      setMessage(message, 'error', '评论不能为空。')
      commentInput.focus()
      return
    }

    submitButton.disabled = true
    submitButton.textContent = '提交中...'

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('reviews').insert([
        {
          user_name: '匿名用户',
          target_type: targetType,
          target_id: selectedTarget.id,
          target_name: selectedTarget.name,
          graft_count: graftCount,
          channel_opening_type: channelOpeningType,
          price_eur: priceEur,
          comment,
          status: 'pending',
        },
      ])

      if (error) throw error

      form.reset()
      targetTypeSelect.value = 'doctor'
      syncTargetOptions()
      setMessage(message, 'success', '提交成功，等待审核')
      if (successActions) successActions.hidden = false
    } catch (error) {
      console.error(error)
      setMessage(message, 'error', `提交失败：${error.message || '请稍后再试'}`)
    } finally {
      submitButton.disabled = false
      submitButton.textContent = '提交评论'
    }
  })
}

function buildReviewCard(review, targetMap) {
  const key = `${normalize(review.target_type)}:${normalize(review.target_id)}`
  const target = targetMap.get(key)
  const displayName = target
    ? target.displayName
    : formatDisplayName(review.target_type, {
        name_zh: review.target_name,
        name_en: review.target_name,
      })
  return `
    <article class="review-card rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-soft">
      <div class="flex flex-wrap items-center gap-2">
        <span class="review-chip review-chip-brand">${escapeHtml(displayName)}</span>
        <span class="review-chip">${escapeHtml(formatTargetType(review.target_type))}</span>
        <span class="review-chip">${escapeHtml(formatChannelType(review.channel_opening_type))}</span>
      </div>
      <div class="mt-4 grid gap-3 text-sm text-stone-700 sm:grid-cols-2 lg:grid-cols-4">
        <div class="review-stat">
          <div class="review-stat-label">移植单位数量</div>
          <div class="review-stat-value">${escapeHtml(review.graft_count || '—')} graft</div>
        </div>
        <div class="review-stat">
          <div class="review-stat-label">价格</div>
          <div class="review-stat-value">€ ${escapeHtml(review.price_eur || '—')}</div>
        </div>
        <div class="review-stat sm:col-span-2 lg:col-span-2">
          <div class="review-stat-label">创建时间</div>
          <div class="review-stat-value">${escapeHtml(formatDateTime(review.created_at))}</div>
        </div>
      </div>
      <div class="mt-4 rounded-[1.2rem] border border-stone-200 bg-stone-50 p-4">
        <div class="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">评论内容</div>
        <p class="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-700">${escapeHtml(review.comment || '')}</p>
      </div>
    </article>
  `
}

async function setupReviewsPage() {
  const root = document.getElementById('reviews-app')
  if (!root) return

  const list = document.getElementById('reviews-list')
  const message = document.getElementById('reviews-message')
  const count = document.getElementById('reviews-count')
  const filterButtons = Array.from(document.querySelectorAll('[data-review-filter]'))
  const targetMap = new Map()
  let allReviews = []
  let activeFilter = 'all'

  const render = () => {
    const filteredReviews = allReviews.filter((item) => activeFilter === 'all' || item.target_type === activeFilter)
    count.textContent = String(filteredReviews.length)

    filterButtons.forEach((button) => {
      const isActive = button.dataset.reviewFilter === activeFilter
      button.classList.toggle('is-active', isActive)
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false')
    })

    if (!filteredReviews.length) {
      list.innerHTML = `
        <div class="rounded-[1.5rem] border border-dashed border-stone-300 bg-white/80 p-8 text-center text-sm leading-7 text-stone-500">
          当前筛选条件下还没有已审核评论。
        </div>
      `
      return
    }

    list.innerHTML = filteredReviews.map((item) => buildReviewCard(item, targetMap)).join('')
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.reviewFilter || 'all'
      render()
    })
  })

  try {
    const targetsByType = await loadTargets()
    Object.entries(targetsByType).forEach(([targetType, items]) => {
      items.forEach((item) => {
        targetMap.set(`${targetType}:${item.id}`, item)
      })
    })

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('reviews')
      .select('created_at,target_type,target_id,target_name,graft_count,channel_opening_type,price_eur,comment,status')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) throw error

    allReviews = Array.isArray(data) ? data : []
    setMessage(message, 'info', '')
    render()
  } catch (error) {
    console.error(error)
    count.textContent = '0'
    list.innerHTML = ''
    setMessage(message, 'error', `评论加载失败：${error.message || '请稍后再试'}`)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupSubmitReview()
  setupReviewsPage()
})
