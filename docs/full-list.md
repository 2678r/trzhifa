import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const csvPath = path.join(ROOT, "data", "clinics.csv");
const outPath = path.join(ROOT, "docs", "full-list.md");

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(field);
      if (row.some((v) => String(v).trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some((v) => String(v).trim() !== "")) rows.push(row);
  }

  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? "").trim();
    });
    return obj;
  });
}

function classify(item) {
  const doctor = (item.doctor_flag || "").toLowerCase();
  const price = (item.price_flag || "").toLowerCase();
  const facility = (item.facility_type || "").toLowerCase();

  if (facility === "hospital") return 4;
  if (doctor === "yes" && price === "public") return 1;
  if (doctor === "yes" && price !== "public") return 2;
  return 3;
}

function mdLink(url) {
  return url ? `[官网](${url})` : "";
}

function row(cols) {
  return `| ${cols.join(" | ")} |`;
}

const csvText = fs.readFileSync(csvPath, "utf8");
const data = parseCSV(csvText);

const sec1 = data.filter((x) => classify(x) === 1);
const sec2 = data.filter((x) => classify(x) === 2);
const sec3 = data.filter((x) => classify(x) === 3);
const sec4 = data.filter((x) => classify(x) === 4);

const lines = [];

lines.push(`---
title: 全部诊所名单
outline: false
---

# 全部诊所名单

本页汇总 2026 年 3 月土耳其卫生部公布的有植发资质的诊所 / 医疗机构。

本页为完整数据库页（${data.length}家），不做筛选，不做推荐，仅按结构分类展示。

---

## 快速跳转

- [① 有医生 + 有价格](#①-有医生--有价格)
- [② 有医生 + 无价格](#②-有医生--无价格)
- [③ 无医生 + 无价格](#③-无医生--无价格)
- [④ 综合医院](#④-综合医院)

---

⚠️ 下方为完整名单，数量较多，请使用浏览器搜索（Cmd/Ctrl + F）或按分类查看。

---
`);

lines.push(`## ① 有医生 + 有价格（${sec1.length}家）

${row(["名称", "区", "医生参与", "价格", "类型", "官网"])}
${row(["------", "----", "----------", "------", "------", "------"])}`);
sec1.forEach((x) => {
  lines.push(
    row([
      x.name || "",
      x.district || "",
      x.doctor_display || "",
      x.price_display || "",
      x.type_display || "",
      mdLink(x.website || ""),
    ])
  );
});

lines.push(`
---

## ② 有医生 + 无价格（${sec2.length}家）

${row(["名称", "区", "医生参与", "价格", "类型", "官网"])}
${row(["------", "----", "----------", "------", "------", "------"])}`);
sec2.forEach((x) => {
  lines.push(
    row([
      x.name || "",
      x.district || "",
      x.doctor_display || "",
      x.price_display || "",
      x.type_display || "",
      mdLink(x.website || ""),
    ])
  );
});

lines.push(`
---

## ③ 无医生 + 无价格（${sec3.length}家）

${row(["名称", "区", "医生参与", "价格", "类型", "官网"])}
${row(["------", "----", "----------", "------", "------", "------"])}`);
sec3.forEach((x) => {
  lines.push(
    row([
      x.name || "",
      x.district || "",
      x.doctor_display || "",
      x.price_display || "",
      x.type_display || "",
      mdLink(x.website || ""),
    ])
  );
});

lines.push(`
---

## ④ 综合医院（${sec4.length}家）

${row(["名称", "区", "类型", "官网"])}
${row(["------", "----", "------", "------"])}`);
sec4.forEach((x) => {
  lines.push(
    row([
      x.name || "",
      x.district || "",
      x.type_display || "",
      mdLink(x.website || ""),
    ])
  );
});

lines.push(`
---

👉 如需快速查找，请使用浏览器搜索（Cmd/Ctrl + F）输入诊所名称。

---

本页为完整归档页，主页面仅展示结构与代表机构。
`);

fs.writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`生成完成：${outPath}`);
console.log(`总数：${data.length} 家`);
console.log(`① ${sec1.length} / ② ${sec2.length} / ③ ${sec3.length} / ④ ${sec4.length}`);