---
layout: home

hero:
  name: "土耳其植发评测网"
  text: "信息透明比推荐更重要！"
  tagline: "为你做手术的是医生，还是护士/团队？"
  actions:
    - theme: brand
      text: ISHRS认证医生
      link: /doctors
    - theme: brand
      text: 跑量诊所
      link: /clinics
    - theme: brand
      text: 艾友植发
      link: /hiv
---

## 说明与合规

**ISHRS（International Society of Hair Restoration Surgery）**  
国际植发外科协会，全球植发医生主要专业组织之一。

**ABHRS（American Board of Hair Restoration Surgery）**  
植发领域的专业认证体系，要求医生通过考试与案例审核。

在土耳其，植发必须在**卫生部注册的医疗机构**中进行：

- 医院（Hastane）
- 医疗中心（Tıp Merkezi）
- 经批准的植发单位

未在官方系统登记的机构，存在合规风险。

本网站收录诊所时，会优先核对官方登记与公开资质信息。

---

## 数据来源（官方）

- ISHRS 医生目录（国际植发外科协会）  
  https://ishrs.org/

- 土耳其卫生部认证植发机构查询  
  https://sacekimmerkezi.saglik.gov.tr/#/

- 土耳其医疗旅游资质机构名单  
  https://dosyamerkez.saglik.gov.tr/Eklenti/54322/0/tip-merkezleripdf.pdf

<style>
/* Hero 区域更像真正首页 */
.VPHomeHero .container {
  max-width: 1180px;
}

.VPHomeHero .main {
  max-width: 760px;
}

.VPHomeHero .name {
  font-size: 22px !important;
  letter-spacing: 0.02em;
}

.VPHomeHero .text {
  font-size: 56px !important;
  line-height: 1.06 !important;
  max-width: 820px;
}

.VPHomeHero .tagline {
  font-size: 22px !important;
  line-height: 1.55 !important;
  max-width: 760px;
  color: var(--vp-c-text-2);
}

/* 四个入口做成大块按钮 */
.VPHomeHero .actions {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  max-width: 960px;
  margin-top: 30px;
}

.VPHomeHero .actions .VPButton {
  display: flex !important;
  align-items: center;
  justify-content: center;
  min-height: 88px;
  padding: 0 18px !important;
  font-size: 22px !important;
  font-weight: 700 !important;
  border-radius: 16px;
  border: 1px solid var(--vp-c-brand-1);
  box-shadow: 0 10px 30px rgba(100, 108, 255, 0.18);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.VPHomeHero .actions .VPButton:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 36px rgba(100, 108, 255, 0.26);
}

/* 正文区域更紧凑一点 */
.vp-doc h2 {
  margin-top: 26px;
  margin-bottom: 14px;
}

.vp-doc p,
.vp-doc li {
  font-size: 17px;
  line-height: 1.8;
}

.vp-doc ul {
  margin-top: 10px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .VPHomeHero .text {
    font-size: 40px !important;
  }

  .VPHomeHero .tagline {
    font-size: 18px !important;
  }

  .VPHomeHero .actions {
    grid-template-columns: 1fr;
    max-width: 100%;
  }

  .VPHomeHero .actions .VPButton {
    min-height: 72px;
    font-size: 22px !important;
  }
}
</style>