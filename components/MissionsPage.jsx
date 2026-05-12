"use client";

import React from "react";
import { Plus, ArrowUpDown, SlidersHorizontal } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import PageHeader from "./PageHeader";
import { MissionsIcon } from "./SideNav/icons";

// MissionsPage — Learning Hub Missions route. Renders the shared
// <PageHeader> in its full two-row layout (identifier + primary CTA on
// row 1; search + sort/filter toolbar on row 2), followed by the empty
// state when no missions exist.
export default function MissionsPage({ onCreateMission }) {
  // TODO: missions list view — wire real data source when available.
  const missions = [];
  const [query, setQuery] = React.useState("");

  const openCreateMission = () => {
    if (onCreateMission) {
      onCreateMission();
      return;
    }
    console.log("open create mission");
  };

  return (
    <div style={mpStyles.column}>
      <PageHeader
        identifier={{
          icon: <MissionsIcon size={18} color="#245BFF" />,
          label: "Missions",
          withDropdown: true,
          // TODO: identifier dropdown menu — wire when scope provided
          onClick: () => {},
        }}
        primaryAction={{
          label: "Mission",
          icon: <Plus size={16} />,
          onClick: openCreateMission,
        }}
        search={{
          value: query,
          onChange: setQuery,
          placeholder: "Search",
        }}
        toolbar={[
          {
            id: "sort",
            icon: <ArrowUpDown size={18} />,
            label: "Sort",
            // TODO: sort menu
            onClick: () => {},
          },
          {
            id: "filter",
            icon: <SlidersHorizontal size={18} />,
            label: "Filter",
            // TODO: filter panel
            onClick: () => {},
          },
        ]}
      />
      {missions.length === 0 ? (
        <MissionsEmptyState onCreate={openCreateMission} />
      ) : (
        // TODO: missions list view
        <div />
      )}
    </div>
  );
}

function EmptyStateIllustration() {
  return (
    <svg
      width="177"
      height="121"
      viewBox="0 0 177 121"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ marginBottom: 12 }}
    >
      <path
        d="M89.1109 108.5C118.811 108.5 143.011 84.4 143.011 54.8C142.911 25.1 118.811 1 89.1109 1C59.3109 1 35.2109 25.1 35.2109 54.7C35.2109 84.4 59.3109 108.5 89.1109 108.5Z"
        fill="#9CA3AF"
        stroke="#6B7280"
        strokeWidth="2"
        strokeMiterlimit="10"
      />
      <path
        d="M146.212 61.5998C146.212 73.0998 136.912 82.3998 125.312 82.3998C125.112 82.3998 123.412 82.3998 110.912 82.3998C102.212 82.3998 88.3117 82.3998 66.1117 82.3998H55.5117C41.6117 82.6998 30.5117 71.5998 30.5117 58.1998C30.5117 44.6998 41.7117 33.4998 55.8117 34.1998C67.9117 -3.60016 123.312 1.69984 128.012 40.7998C138.412 42.0998 146.212 50.8998 146.212 61.5998Z"
        fill="white"
        stroke="#6B7280"
        strokeWidth="2"
        strokeMiterlimit="10"
      />
      <path
        d="M127.712 40.9008C126.912 40.8008 126.112 40.8008 125.312 40.8008C121.212 40.8008 117.312 42.0008 114.012 44.1008"
        fill="white"
      />
      <path
        d="M127.712 40.9008C126.912 40.8008 126.112 40.8008 125.312 40.8008C121.212 40.8008 117.312 42.0008 114.012 44.1008"
        stroke="#6B7280"
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <path
        d="M55.8117 34.1992C54.6117 37.7992 54.0117 41.5992 54.0117 45.5992C54.0117 47.1992 54.1117 48.6992 54.3117 50.1992"
        fill="white"
      />
      <path
        d="M55.8117 34.1992C54.6117 37.7992 54.0117 41.5992 54.0117 45.5992C54.0117 47.1992 54.1117 48.6992 54.3117 50.1992"
        stroke="#6B7280"
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M78.2234 57.6871C79.7981 57.6871 81.1305 56.3547 81.1305 54.7801C81.1305 53.2054 79.7981 51.873 78.2234 51.873C76.6488 51.873 75.3164 53.2054 75.3164 54.7801C75.3164 56.3547 76.6488 57.6871 78.2234 57.6871Z"
        fill="#6B7280"
      />
      <path
        d="M100.509 57.6871C102.083 57.6871 103.416 56.3547 103.416 54.7801C103.416 53.2054 102.083 51.873 100.509 51.873C98.9339 51.873 97.6016 53.2054 97.6016 54.7801C97.6016 56.4759 98.9339 57.6871 100.509 57.6871Z"
        fill="#6B7280"
      />
      <path
        d="M78.1096 45.1624L71.7148 48.6152L72.5781 50.2139L78.9728 46.7611L78.1096 45.1624Z"
        fill="#6B7280"
      />
      <path
        d="M100.117 45.116L99.2539 46.7148L105.649 50.1669L106.512 48.5681L100.117 45.116Z"
        fill="#6B7280"
      />
      <path
        d="M89.3681 64.4701C91.2412 64.4701 92.7597 63.3313 92.7597 61.9265C92.7597 60.5216 91.2412 59.3828 89.3681 59.3828C87.495 59.3828 85.9766 60.5216 85.9766 61.9265C85.9766 63.3313 87.495 64.4701 89.3681 64.4701Z"
        fill="#6B7280"
      />
      <path
        d="M18.085 15.3613C18.085 15.3613 4.10641 18.9104 8.34234 21.7497C12.5783 24.447 22.6033 29.1319 32.0635 26.0086C41.5237 22.8854 32.0635 18.4845 32.2047 18.4845C32.3459 18.4845 18.085 15.3613 18.085 15.3613Z"
        fill="#F1F3F9"
        stroke="#6B7280"
        strokeWidth="2"
        strokeMiterlimit="10"
      />
      <path
        d="M1 14.2253C6.08311 15.7869 21.756 13.2315 31.781 6.70117C39.6881 16.4967 42.6532 19.052 45.4772 19.336C41.1001 23.7369 26.5567 30.8351 18.3673 21.6074C8.76586 27.7119 1 14.2253 1 14.2253Z"
        fill="white"
        stroke="#6B7280"
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <path
        d="M131.07 49.722C136.436 50.006 150.979 43.4756 158.886 34.6738C169.052 42.1979 172.441 43.9015 175.406 43.4756C172.159 48.8702 162.275 60.6533 148.296 61.5051C138.13 55.5426 131.07 49.722 131.07 49.722Z"
        fill="white"
        stroke="#6B7280"
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <path
        d="M88.2379 116.312C87.1764 111.045 77.2292 98.5868 66.7352 93.1214C71.4898 81.4014 72.2956 77.6952 71.1445 74.9296C77.178 76.731 91.0517 83.3682 95.3586 96.6939C92.1164 108.025 88.2379 116.312 88.2379 116.312Z"
        fill="white"
        stroke="#6B7280"
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MissionsEmptyState({ onCreate }) {
  return (
    <Card style={{ flex: 1, display: "flex" }}>
      <div style={mpStyles.emptyState}>
        <EmptyStateIllustration />
        <h2 style={mpStyles.emptyHeading}>No missions yet</h2>
        <p style={mpStyles.emptyBody}>
          Set the scenarios, targets, and teams — then track readiness as agents practice
        </p>
        <div style={mpStyles.emptyCtaSpacer}>
          <Button
            variant="primary"
            leadingIcon={<Plus size={16} />}
            onClick={onCreate}
          >
            Mission
          </Button>
        </div>
      </div>
    </Card>
  );
}

const mpStyles = {
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    width: "100%",
    flex: 1,
    minHeight: 0,
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 12,
    paddingBlock: 56,
  },
  emptyHeading: {
    fontFamily: "var(--font-sans)",
    fontSize: 20,
    fontWeight: 700,
    color: "var(--do-ink)",
    lineHeight: 1.3,
    margin: 0,
  },
  emptyBody: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    maxWidth: 480,
    margin: 0,
    lineHeight: 1.5,
  },
  emptyCtaSpacer: {
    marginTop: 16,
  },
};
