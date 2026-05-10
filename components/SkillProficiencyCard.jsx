"use client";

import React from "react";
import Card from "./Card";
import Button from "./Button";

const SKILL_DATA = [
  { skill: "Demonstrating ownership", evaluated: 704, strength: "0%", meet: "22%", needs: "77%", recs: 534 },
  { skill: "Overcoming objections",   evaluated: 704, strength: "0%", meet: "9%",  needs: "56%", recs: 434 },
  { skill: "Closing the sale",        evaluated: 704, strength: "0%", meet: "40%", needs: "47%", recs: 299 },
  { skill: "Expressing empathy",      evaluated: 704, strength: "0%", meet: "61%", needs: "39%", recs: 344 },
  { skill: "Communicating clearly",   evaluated: 704, strength: "0%", meet: "65%", needs: "35%", recs: 283 },
  { skill: "Active listening",        evaluated: 704, strength: "2%", meet: "58%", needs: "40%", recs: 312 },
  { skill: "Problem resolution",      evaluated: 704, strength: "1%", meet: "44%", needs: "55%", recs: 410 },
];

const SKILL_COLUMNS = [
  { key: "skill",  label: "Skills",              width: "22%", align: "left" },
  { key: "evaluated", label: "Evaluated",        width: "13%", align: "left" },
  { key: "strength",  label: "Strength",         width: "13%", align: "left" },
  { key: "meet",   label: "Meet Expectation",    width: "16%", align: "left" },
  { key: "needs",  label: "Needs Improvement",   width: "18%", align: "left", sorted: true },
  { key: "recs",   label: "Recommendations",     width: "18%", align: "left", icon: true, highlight: true },
];

const PAGE_SIZE = 5;

export default function SkillProficiencyCard() {
  const [page, setPage] = React.useState(0);
  const totalPages = Math.ceil(SKILL_DATA.length / PAGE_SIZE);
  const pageData = SKILL_DATA.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <Card>
      <div style={spStyles.titleRow}>
        <div style={spStyles.title}>Skill Proficiency Index</div>
        <div style={spStyles.subtitle}>Agent strengths across key performance areas</div>
      </div>

      <div style={spStyles.divider}></div>

      <div style={spStyles.tableHeader}>
        {SKILL_COLUMNS.map((col) => (
          <div key={col.key} style={{ ...spStyles.th, width: col.width, textAlign: col.align }}>
            {col.icon && (
              <span className="material-symbols-outlined" style={spStyles.gearIcon}>settings</span>
            )}
            <span>{col.label}</span>
            {col.sorted && (
              <span className="material-symbols-outlined" style={spStyles.sortIcon}>arrow_downward</span>
            )}
          </div>
        ))}
      </div>

      {pageData.map((row, i) => (
        <div key={i} style={{
          ...spStyles.tableRow,
          borderBottom: i < pageData.length - 1 ? "1px solid #F0F2FA" : "none",
        }}>
          {SKILL_COLUMNS.map((col) => (
            <div key={col.key} style={{
              ...spStyles.td,
              width: col.width,
              textAlign: col.align,
              ...(col.highlight ? spStyles.recCell : {}),
            }}>
              {row[col.key]}
            </div>
          ))}
        </div>
      ))}

      {/* Pagination — table-local. Promote to a shared <Pagination> when a 3rd table appears. */}
      <div style={spStyles.pagination}>
        <Button
          variant="text"
          uppercase={false}
          disabled={page === 0}
          onClick={() => page > 0 && setPage(page - 1)}
          leadingIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>}
        >
          Previous
        </Button>
        <span style={spStyles.pageInfo}>{page + 1}/{totalPages}</span>
        <Button
          variant="text"
          uppercase={false}
          disabled={page >= totalPages - 1}
          onClick={() => page < totalPages - 1 && setPage(page + 1)}
          trailingIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>}
          style={{ color: page >= totalPages - 1 ? undefined : "var(--color-button-primary-bg)" }}
        >
          Next
        </Button>
      </div>
    </Card>
  );
}

const spStyles = {
  titleRow: { marginBottom: 4 },
  title: {
    fontFamily: '"Mulish", sans-serif', fontSize: 16, fontWeight: 700,
    color: "#1F232A", lineHeight: 1.4, marginBottom: 2,
  },
  subtitle: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 400,
    color: "rgba(0,0,0,0.60)", lineHeight: 1.4,
  },
  divider: { height: 1, background: "#E8ECFF", margin: "16px 0 0" },
  tableHeader: {
    display: "flex", alignItems: "center", padding: "14px 0 10px",
    borderBottom: "1px solid #E8ECFF",
  },
  th: {
    fontFamily: '"Mulish", sans-serif', fontSize: 12, fontWeight: 700,
    color: "rgba(0,0,0,0.87)", lineHeight: 1.4,
    display: "flex", alignItems: "center", gap: 4,
  },
  gearIcon: {
    fontSize: 14, color: "rgba(0,0,0,0.60)",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
  },
  sortIcon: {
    fontSize: 14, color: "rgba(0,0,0,0.60)",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
  },
  tableRow: { display: "flex", alignItems: "center", padding: "14px 0" },
  td: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 400,
    color: "rgba(0,0,0,0.87)", lineHeight: 1.4,
  },
  recCell: {
    background: "#E8ECFF", borderRadius: 4, padding: "6px 12px",
    margin: "-6px 0", marginRight: -12,
  },
  pagination: {
    display: "flex", alignItems: "center", justifyContent: "flex-end",
    gap: 12, marginTop: 16,
  },
  pageBtn: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 500,
    background: "none", border: "none", display: "flex",
    alignItems: "center", gap: 4, padding: 0,
  },
  pageInfo: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 400,
    color: "rgba(0,0,0,0.60)",
  },
};
