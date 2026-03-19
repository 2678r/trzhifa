const formatDoctorStatus = (doctor) => doctor.ishrs_status_cn || doctor.ishrs_status || '—'
const normalize = (value) => String(value || '').trim()

async function loadJson(path) {
  const response = await fetch(path)
  if (!response.ok) throw new Error(`Failed to load ${path}`)
  return response.json()
}

function websiteHost(url) {
  const value = normalize(url)
  if (!value) return '—'
  return value.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function statusScore(doctor) {
  const status = normalize(doctor.ishrs_status).toLowerCase()
  if (status === 'fellow') return 3
  if (status === 'member') return 2
  if (status === 'former_member') return 1
  return 0
}

function clinicStructure(clinic) {
  const type = normalize(clinic.facility_type).toLowerCase()
  const hasDoctor = normalize(clinic.lead_doctor) !== ''
  const hasPrice = normalize(clinic.price_transparency) !== ''
  if (type === 'hospital') return '大型医院'
  if (hasDoctor && hasPrice) return '有医生 + package'
  if (hasDoctor) return '有医生 + 需咨询'
  return '其他'
}

function clinicTypeLabel(clinic) {
  const type = normalize(clinic.facility_type).toLowerCase()
  if (type === 'hospital') return '医院'
  if (type === 'medical_center') return '医疗中心'
  if (type === 'polyclinic') return '门诊 / 诊所'
  if (type === 'private clinic') return '私人诊所'
  return normalize(clinic.facility_type) || '未标注'
}

function clinicPriceLabel(clinic) {
  return normalize(clinic.price_transparency) ? '公开价格' : '价格需咨询'
}

function shortNote(text) {
  const note = normalize(text)
  if (!note) return '—'
  if (note.length <= 140) return note
  return `${note.slice(0, 140)}...`
}

function setupHome() {
  Promise.all([loadJson('/data/doctors.json'), loadJson('/data/clinics.json')]).then(([doctors, clinics]) => {
    document.querySelector('[data-home-doctors]').textContent = doctors.length
    document.querySelector('[data-home-clinics]').textContent = clinics.length
  })
}

function setupDoctors() {
  const grid = document.getElementById('doctor-grid')
  const count = document.getElementById('doctor-count')
  const searchInput = document.getElementById('doctor-search')
  const citySelect = document.getElementById('doctor-city')
  const statusSelect = document.getElementById('doctor-status')
  const sortSelect = document.getElementById('doctor-sort')

  loadJson('/data/doctors.json').then((doctors) => {
    const cities = [...new Set(doctors.map((doctor) => doctor.city_cn || doctor.city).filter(Boolean))]
    citySelect.innerHTML = `<option value="all">全部城市</option>${cities
      .map((city) => `<option value="${city}">${city}</option>`)
      .join('')}`

    const render = () => {
      const q = searchInput.value.trim().toLowerCase()
      const city = citySelect.value
      const status = statusSelect.value
      const sort = sortSelect.value

      let result = doctors.filter((doctor) => {
        const matchSearch =
          !q ||
          [
            doctor.doctor_name_cn,
            doctor.doctor_name_en,
            doctor.city_cn,
            doctor.city,
            doctor.specialty_cn,
            doctor.specialty_en,
            doctor.notes_cn,
            doctor.note_en,
            doctor.website,
            doctor.background_type_cn,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(q))

        const matchCity = city === 'all' || (doctor.city_cn || doctor.city) === city
        const matchStatus = status === 'all' || normalize(doctor.ishrs_status).toLowerCase() === status
        return matchSearch && matchCity && matchStatus
      })

      result = result.sort((a, b) => {
        if (sort === 'name') {
          return (a.doctor_name_cn || a.doctor_name_en).localeCompare(b.doctor_name_cn || b.doctor_name_en, 'zh-Hans-CN-u-co-pinyin')
        }
        if (sort === 'city') {
          return (a.city_cn || a.city).localeCompare(b.city_cn || b.city, 'zh-Hans-CN-u-co-pinyin')
        }
        return statusScore(b) - statusScore(a)
      })

      count.textContent = result.length
      grid.innerHTML = result
        .map((doctor) => {
          const note = doctor.notes_cn || doctor.note_en || doctor.publications_cn || doctor.publications || '暂无补充信息'
          const hasAbhrs = normalize(doctor.abhrs).toLowerCase() === 'yes'
          const photo = normalize(doctor.photo)
          const initials = (doctor.doctor_name_cn || doctor.doctor_name_en || 'TR').slice(0, 2)
          return `
            <article class="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-soft">
              <div class="flex gap-4">
                <div class="relative h-20 w-20 shrink-0 overflow-hidden rounded-3xl border border-stone-200 bg-stone-100">
                  ${photo ? `<img src="${photo}" alt="${doctor.doctor_name_cn || doctor.doctor_name_en}" class="h-full w-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid'" />` : ''}
                  <div class="avatar-fallback ${photo ? '' : '!grid'} absolute inset-0 place-items-center bg-stone-100 text-xl font-semibold text-stone-500">${initials}</div>
                </div>
                <div class="min-w-0 flex-1">
                  <h2 class="text-2xl font-semibold tracking-tight">${doctor.doctor_name_cn || doctor.doctor_name_en}</h2>
                  <p class="mt-1 text-sm text-stone-500">${doctor.doctor_name_en || ''}</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <span class="pill ${normalize(doctor.ishrs_status).toLowerCase() === 'fellow' ? 'pill-success' : ''}">${formatDoctorStatus(doctor)}</span>
                    <span class="pill ${hasAbhrs ? 'pill-brand' : ''}">${hasAbhrs ? 'ABHRS' : '无 ABHRS'}</span>
                    <span class="pill">${doctor.city_cn || doctor.city || '未标注城市'}</span>
                  </div>
                </div>
              </div>
              <dl class="mt-5 grid gap-3 text-sm text-stone-600">
                <div><dt class="text-stone-500">职业背景</dt><dd class="mt-1 text-stone-900">${doctor.background_type_cn || doctor.background_type_en || '未标注'}</dd></div>
                <div><dt class="text-stone-500">专长</dt><dd class="mt-1 text-stone-900">${doctor.specialty_cn || doctor.specialty_en || '未标注'}</dd></div>
                <div><dt class="text-stone-500">手术模型</dt><dd class="mt-1 text-stone-900">${doctor.surgery_model_cn || doctor.surgery_model || '未标注'}</dd></div>
                <div><dt class="text-stone-500">备注</dt><dd class="mt-1 whitespace-pre-line leading-7 text-stone-900">${note}</dd></div>
              </dl>
              <div class="mt-5 flex items-center justify-between gap-4 text-sm">
                <a href="${doctor.website || '#'}" ${doctor.website ? 'target="_blank" rel="noreferrer"' : ''} class="font-medium text-clay ${doctor.website ? '' : 'pointer-events-none text-stone-400'}">${doctor.website ? websiteHost(doctor.website) : '暂无官网'}</a>
                <span class="text-stone-500">核对：${doctor.last_verified || '—'}</span>
              </div>
            </article>
          `
        })
        .join('')
    }

    ;[searchInput, citySelect, statusSelect, sortSelect].forEach((el) => el.addEventListener('input', render))
    render()
  })
}

function setupClinics() {
  const tableBody = document.getElementById('clinic-table-body')
  const count = document.getElementById('clinic-count')
  const total = document.getElementById('clinic-total')
  const searchInput = document.getElementById('clinic-search')
  const typeSelect = document.getElementById('clinic-type')
  const structureSelect = document.getElementById('clinic-structure')
  const pricingSelect = document.getElementById('clinic-pricing')
  const sortSelect = document.getElementById('clinic-sort')

  loadJson('/data/clinics.json').then((clinics) => {
    total.textContent = clinics.length
    const types = [...new Set(clinics.map(clinicTypeLabel))]
    typeSelect.innerHTML = `<option value="all">全部机构类型</option>${types
      .map((type) => `<option value="${type}">${type}</option>`)
      .join('')}`

    const render = () => {
      const q = searchInput.value.trim().toLowerCase()
      const type = typeSelect.value
      const structure = structureSelect.value
      const pricing = pricingSelect.value
      const sort = sortSelect.value

      let result = clinics.filter((clinic) => {
        const hasDoctor = normalize(clinic.lead_doctor) !== ''
        const hasPrice = normalize(clinic.price_transparency) !== ''
        const typeLabel = clinicTypeLabel(clinic)
        const structureLabel = clinicStructure(clinic)

        const matchSearch =
          !q ||
          [
            clinic.clinic_id,
            clinic.clinic_name,
            clinic.official_name,
            clinic.lead_doctor,
            clinic.note,
            clinic.website,
            typeLabel,
            structureLabel,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(q))

        const matchType = type === 'all' || typeLabel === type
        const matchStructure =
          structure === 'all' ||
          (structure === 'doctor_public' && structureLabel === '有医生 + package') ||
          (structure === 'doctor_private' && structureLabel === '有医生 + 需咨询') ||
          (structure === 'hospital' && structureLabel === '大型医院') ||
          (structure === 'other' && structureLabel === '其他')
        const matchPricing =
          pricing === 'all' || (pricing === 'public' && hasPrice) || (pricing === 'private' && !hasPrice)

        return matchSearch && matchType && matchStructure && matchPricing
      })

      result = result.sort((a, b) => {
        if (sort === 'name') {
          return (a.clinic_name || a.official_name).localeCompare(b.clinic_name || b.official_name, 'zh-Hans-CN-u-co-pinyin')
        }
        if (sort === 'recent') {
          return normalize(b.last_checked).localeCompare(normalize(a.last_checked))
        }
        const score = (clinic) => {
          const structure = clinicStructure(clinic)
          if (structure === '有医生 + package') return 4
          if (structure === '有医生 + 需咨询') return 3
          if (structure === '大型医院') return 2
          return 1
        }
        return score(b) - score(a)
      })

      count.textContent = result.length
      tableBody.innerHTML = result
        .map((clinic) => {
          const structure = clinicStructure(clinic)
          const structureClass =
            structure === '有医生 + package'
              ? 'pill-success'
              : structure === '有医生 + 需咨询'
                ? 'pill-brand'
                : structure === '大型医院'
                  ? 'pill-warning'
                  : ''
          return `
            <tr class="border-b border-stone-200 align-top hover:bg-stone-50/70">
              <td class="px-4 py-4">
                <div class="font-semibold text-stone-900">${clinic.clinic_name || clinic.official_name || '未命名机构'}</div>
                <div class="mt-1 max-w-xs text-sm leading-6 text-stone-500">${clinic.official_name || ''}</div>
                <div class="mt-2 inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-500">${clinic.clinic_id}</div>
              </td>
              <td class="px-4 py-4"><span class="pill">${clinicTypeLabel(clinic)}</span></td>
              <td class="px-4 py-4"><span class="pill ${structureClass}">${structure}</span></td>
              <td class="px-4 py-4 text-stone-700">${clinic.lead_doctor || '<span class="text-stone-400">未标注</span>'}</td>
              <td class="px-4 py-4"><span class="pill ${normalize(clinic.price_transparency) ? 'pill-success' : ''}">${clinicPriceLabel(clinic)}</span></td>
              <td class="table-cell-note px-4 py-4 text-stone-700" title="${(clinic.note || '').replace(/"/g, '&quot;')}">${shortNote(clinic.note)}</td>
              <td class="px-4 py-4"><a href="${clinic.website || '#'}" ${clinic.website ? 'target="_blank" rel="noreferrer"' : ''} class="${clinic.website ? 'text-clay' : 'pointer-events-none text-stone-400'}">${clinic.website ? websiteHost(clinic.website) : '—'}</a></td>
              <td class="px-4 py-4 text-stone-500">${clinic.last_checked || '—'}</td>
            </tr>
          `
        })
        .join('')
    }

    ;[searchInput, typeSelect, structureSelect, pricingSelect, sortSelect].forEach((el) => el.addEventListener('input', render))
    render()
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page
  if (page === 'home') setupHome()
  if (page === 'doctors') setupDoctors()
  if (page === 'clinics') setupClinics()
})
