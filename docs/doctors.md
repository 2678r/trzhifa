---
title: 医生列表
outline: false
---

<script setup>
import doctors from '../data/doctors.json'

const getAbhrs = (doc) => doc.abhers || doc['abhers（American Board of Hair Restoration Surgery）'] || ''
const getPhoto = (doc) => {
  if (!doc.photo) return ''
  if (doc.photo.endsWith('.jpeg')) return doc.photo
  if (doc.photo.endsWith('.jpg')) return doc.photo.replace('.jpg', '.jpeg')
  return doc.photo
}

const doctorLed = doctors.filter(d => (d.surgery_model || '').includes('医生主导'))
const doctorTeam = doctors.filter(d => !(d.surgery_model || '').includes('医生主导'))
</script>

## 医生列表

本页基于 ISHRS（国际植发外科协会）官网公开信息整理，并结合医生官网与公开资料核实。

👉 信息透明，比推荐更重要

---

## 医生主导

<div v-for="doc in doctorLed" :key="doc.doctor_id || doc.doctor_name" class="doctor-row">
  <div class="doctor-item">
    <img v-if="getPhoto(doc)" :src="getPhoto(doc)" class="avatar" />
    <div class="info">
      <div class="name">{{ doc.doctor_name }}</div>
      <div class="meta">
        {{ doc.city }} · {{ doc.district }} ｜{{ doc.doctor_type }} ｜{{ doc.specialty }}
      </div>
      <div class="tags">
        <span>{{ doc.surgery_model }}</span>
        <span v-if="doc.ishrs_status">ISHRS：{{ doc.ishrs_status }}</span>
        <span v-if="getAbhrs(doc)">ABHRS：{{ getAbhrs(doc) }}</span>
      </div>
      <div class="note" v-if="doc.notes">{{ doc.notes }}</div>
      <div class="links">
        <a v-if="doc.website" :href="doc.website" target="_blank" rel="noreferrer">官网</a>
      </div>
    </div>
  </div>
</div>

---

## 医生 + 团队

<div v-for="doc in doctorTeam" :key="doc.doctor_id || doc.doctor_name" class="doctor-row">
  <div class="doctor-item">
    <img v-if="getPhoto(doc)" :src="getPhoto(doc)" class="avatar" />
    <div class="info">
      <div class="name">{{ doc.doctor_name }}</div>
      <div class="meta">
        {{ doc.city }} · {{ doc.district }} ｜{{ doc.doctor_type }} ｜{{ doc.specialty }}
      </div>
      <div class="tags">
        <span>{{ doc.surgery_model }}</span>
        <span v-if="doc.ishrs_status">ISHRS：{{ doc.ishrs_status }}</span>
        <span v-if="getAbhrs(doc)">ABHRS：{{ getAbhrs(doc) }}</span>
      </div>
      <div class="note" v-if="doc.notes">{{ doc.notes }}</div>
      <div class="links">
        <a v-if="doc.website" :href="doc.website" target="_blank" rel="noreferrer">官网</a>
      </div>
    </div>
  </div>
</div>

---

## 数据说明

👉 不做推荐 / 不做排名  
👉 仅做信息整理与分类  

---

## ISHRS（国际植发外科协会）

ISHRS（International Society of Hair Restoration Surgery）是全球最权威的植发医生学术组织之一。

👉 全球成员：约 1000+  
👉 覆盖国家：70+  

### 成员类型：

- Member（会员）  
  → 需具备医学背景，并从事植发相关工作

- Fellow / Researcher（研究员）  
  → 在植发领域具有经验积累或学术参与

### 重要说明：

👉 ISHRS 是学术组织，不等同于手术水平评级  
👉 但代表医生参与国际行业体系  

⚠️ 非成员不得使用 ISHRS 标识进行宣传  

---

## ABHRS（美国植发外科委员会认证）

ABHRS 是植发领域少数考试认证体系之一。

👉 全球通过人数：约 200+  

### 获取条件：

- 必须是执业医生  
- 具备大量植发手术经验  
- 通过专业考试  

👉 可理解为：

👉 植发领域“高门槛专业认证”  

---

## 手工 FUE（Manual FUE）

FUE 为主流植发技术（毛囊单位提取）

其中：

👉 手工 FUE = 医生手动提取毛囊  

特点：

- 控制更精细  
- 对供体损伤更小  
- 速度较慢  
- 对医生经验要求高  

---

## 关于预约与沟通

本页医生存在不同模式：

### ① 诊所/团队模式
- 有客服
- 回复较快

### ② 医生个人主导
- 无营销 / 无客服
- 需 WhatsApp 或 Email 联系

👉 此类医生通常：
- 手术量控制严格  
- 回复较慢  

---

### ⚠️ 联系建议：

- 提供清晰照片（正面 / 顶部 / 后枕部）
- 描述脱发情况与需求
- 使用英文沟通
- 保持耐心  

👉 未回复 ≠ 不接诊  

---

## 关于医生与诊所

植发行业中：

👉 医生 ≠ 全程亲自操作  

常见模式：

- 医生主导  
- 医生 + 团队  
- 团队模式  

👉 本页已标注手术模式供参考  

<style>
.doctor-row {
  padding: 14px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.doctor-item {
  display: flex;
  gap: 14px;
  align-items: center;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.info {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
}

.meta {
  margin-top: 4px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tags span {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.note {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.links {
  margin-top: 8px;
}

.links a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 600;
}
</style>