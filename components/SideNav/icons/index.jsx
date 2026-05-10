"use client";

import React from "react";

// All icons share the Material Symbols 960×960 viewBox so sizing/centering
// is identical across module configs. Single fill color, set by parent.

function MaterialPath({ size, color, d }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      fill={color}
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}

export const AppSwitcherIcon = ({ size = 22, color = "currentColor" }) => (
  <MaterialPath
    size={size}
    color={color}
    d="M183.5-183.5Q160-207 160-240t23.5-56.5Q207-320 240-320t56.5 23.5Q320-273 320-240t-23.5 56.5Q273-160 240-160t-56.5-23.5Zm240 0Q400-207 400-240t23.5-56.5Q447-320 480-320t56.5 23.5Q560-273 560-240t-23.5 56.5Q513-160 480-160t-56.5-23.5Zm240 0Q640-207 640-240t23.5-56.5Q687-320 720-320t56.5 23.5Q800-273 800-240t-23.5 56.5Q753-160 720-160t-56.5-23.5Zm-480-240Q160-447 160-480t23.5-56.5Q207-560 240-560t56.5 23.5Q320-513 320-480t-23.5 56.5Q273-400 240-400t-56.5-23.5Zm240 0Q400-447 400-480t23.5-56.5Q447-560 480-560t56.5 23.5Q560-513 560-480t-23.5 56.5Q513-400 480-400t-56.5-23.5Zm240 0Q640-447 640-480t23.5-56.5Q687-560 720-560t56.5 23.5Q800-513 800-480t-23.5 56.5Q753-400 720-400t-56.5-23.5Zm-480-240Q160-687 160-720t23.5-56.5Q207-800 240-800t56.5 23.5Q320-753 320-720t-23.5 56.5Q273-640 240-640t-56.5-23.5Zm240 0Q400-687 400-720t23.5-56.5Q447-800 480-800t56.5 23.5Q560-753 560-720t-23.5 56.5Q513-640 480-640t-56.5-23.5Zm240 0Q640-687 640-720t23.5-56.5Q687-800 720-800t56.5 23.5Q800-753 800-720t-23.5 56.5Q753-640 720-640t-56.5-23.5Z"
  />
);

export const SettingsIcon = ({ size = 22, color = "currentColor" }) => (
  <MaterialPath
    size={size}
    color={color}
    d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm112-260q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Z"
  />
);

export const HelpIcon = ({ size = 22, color = "currentColor" }) => (
  <MaterialPath
    size={size}
    color={color}
    d="M484-247q16 0 27-11t11-27q0-16-11-27t-27-11q-16 0-27 11t-11 27q0 16 11 27t27 11Zm-35-146h59q0-26 6.5-47.5T555-490q31-26 44-51t13-55q0-53-34.5-85T486-713q-49 0-86.5 24.5T345-621l53 20q9-28 28.5-43.5T485-660q28 0 46 16t18 42q0 23-15.5 41T504-526q-22 23-38.5 47T449-393Zm31 313q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"
  />
);

// === Insights Hub module icons ===

export const RocketLaunchIcon = ({ size = 22, color = "currentColor" }) => (
  <MaterialPath
    size={size}
    color={color}
    d="m226-559 78 33q14-28 29-54t33-52l-56-11-84 84Zm142 83 114 113q42-16 90-49t90-75q70-70 109.5-155.5T806-800q-72-5-158 34.5T492-656q-42 42-75 90t-49 90Zm155-121.5q0-33.5 23-56.5t57-23q34 0 57 23t23 56.5q0 33.5-23 56.5t-57 23q-34 0-57-23t-23-56.5ZM565-220l84-84-11-56q-26 18-52 32.5T532-299l33 79Zm313-653q19 121-23.5 235.5T708-419l20 99q4 20-2 39t-20 33L538-80l-84-197-171-171-197-84 167-168q14-14 33.5-20t39.5-2l99 20q104-104 218-147t235-24ZM157-321q35-35 85.5-35.5T328-322q35 35 34.5 85.5T327-151q-25 25-83.5 43T82-76q14-103 32-161.5t43-83.5Zm57 56q-10 10-20 36.5T180-175q27-4 53.5-13.5T270-208q12-12 13-29t-11-29q-12-12-29-11.5T214-265Z"
  />
);

// Interaction (Insights Hub) — overlapping chat-bubble pair. Own 20×20
// viewBox (separate from the Material 960×960 set).
export const ChatBubbleIcon = ({ size = 22, color = "currentColor" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M12.4998 3.33332V9.16666H4.30817L3.33317 10.1417V3.33332H12.4998ZM13.3332 1.66666H2.49984C2.0415 1.66666 1.6665 2.04166 1.6665 2.49999V14.1667L4.99984 10.8333H13.3332C13.7915 10.8333 14.1665 10.4583 14.1665 9.99999V2.49999C14.1665 2.04166 13.7915 1.66666 13.3332 1.66666ZM17.4998 4.99999H15.8332V12.5H4.99984V14.1667C4.99984 14.625 5.37484 15 5.83317 15H14.9998L18.3332 18.3333V5.83332C18.3332 5.37499 17.9582 4.99999 17.4998 4.99999Z"
      fill={color}
    />
  </svg>
);

// Agents (Insights Hub) — square mark with chart + dot at corner.
// Uses its own 20×20 viewBox (separate from the Material 960×960 set).
export const AgentSquareIcon = ({ size = 22, color = "currentColor" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M9.99984 1.66666C5.39984 1.66666 1.6665 5.39999 1.6665 9.99999C1.6665 14.6 5.39984 18.3333 9.99984 18.3333H16.6665C17.5832 18.3333 18.3332 17.5833 18.3332 16.6667V9.99999C18.3332 5.39999 14.5998 1.66666 9.99984 1.66666ZM9.99984 16.6667C7.5915 16.6667 5.47484 15.3833 4.30817 13.4667L6.7665 11.0083L9.50817 13.3333L13.3332 9.51666V10.8333H14.9998V6.66666H10.8332V8.33332H12.1498L9.4165 11.0667L6.6665 8.74999L3.5915 11.8333C3.42484 11.25 3.33317 10.6333 3.33317 9.99999C3.33317 6.32499 6.32484 3.33332 9.99984 3.33332C13.6748 3.33332 16.6665 6.32499 16.6665 9.99999C16.6665 13.675 13.6748 16.6667 9.99984 16.6667ZM16.2498 17.0833C15.7915 17.0833 15.4165 16.7083 15.4165 16.25C15.4165 15.7917 15.7915 15.4167 16.2498 15.4167C16.7082 15.4167 17.0832 15.7917 17.0832 16.25C17.0832 16.7083 16.7082 17.0833 16.2498 17.0833Z"
      fill={color}
    />
  </svg>
);

export const SupportAgentIcon = ({ size = 22, color = "currentColor" }) => (
  <MaterialPath
    size={size}
    color={color}
    d="M800-440q0-82-31.5-153t-86-124q-54.5-53-127-83.5T400-832q-82 0-152 31.5T123-717q-54.5 54-86 124T6-440H80q9-103 56.5-185.5T265-758q73-46 165-46t165 46q72 46 119.5 132.5T771-440h29Zm-400 320q-83 0-156-31.5t-127-86q-54-54.5-85.5-127T0-520q0-43 8-83t24-78l57 33q-13 33-21 67t-8 71q0 76 28.5 142t78 115Q216-204 282-175.5T424-147v-80H280v-90q0-26 19-44t45-18h180q26 0 45 18t19 44v144h97q41 0 71-30t30-71v-50q0-12 8.5-21.5T804-323q9 0 16 4.5t10 12.5q14 17 23.5 38t9.5 47v40q0 67-46.5 113.5T703-21h-58q-11 21-30 31t-43 10h-92q-23 0-43-10t-30-31h-7Z"
  />
);

export const FaceScanIcon = ({ size = 22, color = "currentColor" }) => (
  <MaterialPath
    size={size}
    color={color}
    d="M480-260q75 0 127.5-52.5T660-440H300q0 75 52.5 127.5T480-260ZM340-540l40-40 40 40 56-56-96-96-96 96 56 56Zm240 0 40-40 40 40 56-56-96-96-96 96 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"
  />
);

// === Learning Hub module icons ===

export const DrillIcon = ({ size = 22, color = "currentColor" }) => (
  <MaterialPath
    size={size}
    color={color}
    d="M120-200q-33 0-56.5-23.5T40-280v-400q0-33 23.5-56.5T120-760h400q33 0 56.5 23.5T600-680v400q0 33-23.5 56.5T520-200H120Zm0-146q44-26 94-40t106-14q56 0 106 14t94 40v-334H120v334Zm122-116q-32-32-32-78t32-78q32-32 78-32t78 32q32 32 32 78t-32 78q-32 32-78 32t-78-32Zm438 262v-560h80v560h-80Zm160 0v-560h80v560h-80Z"
  />
);

export const InteractionsIcon = ({ size = 22, color = "currentColor" }) => (
  <MaterialPath
    size={size}
    color={color}
    d="M280-240q-17 0-28.5-11.5T240-280v-80h520v-360h80q17 0 28.5 11.5T880-680v600L720-240H280ZM80-280v-560q0-17 11.5-28.5T120-880h520q17 0 28.5 11.5T680-840v360q0 17-11.5 28.5T640-440H240L80-280Z"
  />
);

export const AgentsIcon = ({ size = 22, color = "currentColor" }) => (
  <MaterialPath
    size={size}
    color={color}
    d="M440-120v-80h320v-284q0-117-81.5-198.5T480-764q-117 0-198.5 81.5T200-484v244h-40q-33 0-56.5-23.5T80-320v-80q0-21 10.5-39.5T120-469l3-53q8-68 39.5-126t79-101q47.5-43 109-67T480-840q68 0 129 24t109 66.5Q766-707 797-649t40 126l3 52q19 9 29.5 27t10.5 38v92q0 20-10.5 38T840-249v49q0 33-23.5 56.5T760-120H440ZM331.5-411.5Q320-423 320-440t11.5-28.5Q343-480 360-480t28.5 11.5Q400-457 400-440t-11.5 28.5Q377-400 360-400t-28.5-11.5Zm240 0Q560-423 560-440t11.5-28.5Q583-480 600-480t28.5 11.5Q640-457 640-440t-11.5 28.5Q617-400 600-400t-28.5-11.5ZM241-462q-7-106 64-182t177-76q89 0 156.5 56.5T720-519q-91-1-167.5-49T435-698q-16 80-67.5 142.5T241-462Z"
  />
);

// === Ask Mira Pro module icons ===

// Mira brand mark — multi-stop linear-gradient sparkle. Brand colors are
// baked in (the `color` prop is accepted for the SideNav Icon contract
// but intentionally ignored). React.useId() uniques the gradient + clip
// ids so multiple instances on the same page don't collide.
export const MiraStarIcon = ({ size = 22 }) => {
  const uid = React.useId().replace(/:/g, "");
  const id = (suffix) => `${uid}-${suffix}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g clipPath={`url(#${id("clip")})`}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.75752 1.69034C10.5232 1.55023 11.2508 2.05507 11.3906 2.8226C11.7359 4.71867 13.6944 5.85319 15.5029 5.20678C16.236 4.94474 17.0537 5.31717 17.3151 6.05207C17.5765 6.78696 17.2094 7.59649 16.4496 7.86807C13.0013 9.1006 9.27467 6.93726 8.61775 3.32999C8.47029 2.5203 8.96477 1.83161 9.75752 1.69034Z"
          fill={`url(#${id("g0")})`}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.0621 14.376C17.566 13.7814 17.4936 12.8899 16.9004 12.3848C15.4349 11.137 15.434 8.86952 16.8967 7.6228C17.4896 7.11739 17.5616 6.22582 17.0574 5.63143C16.5532 5.03705 15.6637 4.96492 15.0708 5.47033C12.2818 7.84751 12.2875 12.1643 15.0756 14.5382C15.6688 15.0433 16.5582 14.9707 17.0621 14.376Z"
          fill={`url(#${id("g1")})`}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.75752 18.3077C10.5232 18.4478 11.2508 17.943 11.3906 17.1754C11.7359 15.2794 13.6944 14.1449 15.5029 14.7913C16.236 15.0533 17.0537 14.6809 17.3151 13.946C17.5765 13.2111 17.2094 12.4016 16.4496 12.13C13.0013 10.8974 9.27467 13.0608 8.61775 16.6681C8.47029 17.4778 8.96477 18.1664 9.75752 18.3077Z"
          fill={`url(#${id("g2")})`}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.241 18.3108C9.47527 18.4509 8.74124 17.9423 8.60146 17.1747C8.25617 15.2787 6.29764 14.1441 4.48918 14.7905C3.75604 15.0526 2.93839 14.6801 2.67697 13.9453C2.41555 13.2104 2.80935 12.3913 3.54249 12.1292C6.99075 10.8967 10.7174 13.0601 11.3743 16.6673C11.525 17.4947 11.0067 18.1707 10.241 18.3108Z"
          fill={`url(#${id("g3")})`}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.93204 14.376C2.42814 13.7814 2.50056 12.8899 3.09379 12.3848C4.55926 11.137 4.56016 8.86952 3.09748 7.6228C2.50451 7.11739 2.43255 6.22582 2.93676 5.63143C3.44096 5.03705 4.3304 4.96492 4.92336 5.47033C7.71234 7.84751 7.70663 12.1643 4.91857 14.5382C4.32534 15.0433 3.43594 14.9707 2.93204 14.376Z"
          fill={`url(#${id("g4")})`}
        />
        <ellipse cx="4.00278" cy="13.4632" rx="1.40708" ry="1.41045" fill="#004BEF" />
        <ellipse cx="10.0028" cy="3.07744" rx="1.40708" ry="1.41045" fill="#004BEF" />
        <ellipse cx="15.9891" cy="6.54424" rx="1.40708" ry="1.41045" fill="#004BEF" />
        <ellipse cx="16.0128" cy="13.4859" rx="1.39172" ry="1.39505" fill="#004BEF" />
        <ellipse cx="9.99888" cy="16.9202" rx="1.40708" ry="1.41045" fill="#004BEF" />
        <path
          d="M8.84461 2.26172C8.63977 2.55063 8.54565 2.92428 8.61805 3.33887C8.81977 4.44655 9.3123 5.41742 9.99598 6.19629C8.45322 7.954 5.93137 8.73201 3.54188 7.87793C2.80889 7.6158 2.41525 6.80513 2.67664 6.07031C2.93811 5.33549 3.75604 4.95476 4.48914 5.2168C6.2975 5.86294 8.25618 4.72798 8.60145 2.83203C8.64033 2.61887 8.72611 2.42657 8.84461 2.26172ZM10.702 1.85352C10.9409 1.98479 11.1287 2.18227 11.2489 2.42188C11.1223 2.18124 10.9314 1.98537 10.702 1.85352ZM9.14247 1.95703C9.17376 1.93351 9.20602 1.91148 9.23914 1.89062C9.20583 1.91142 9.1737 1.93372 9.14247 1.95703ZM9.48329 1.76855C9.4011 1.8005 9.3233 1.83981 9.24989 1.88477C9.32391 1.83906 9.40173 1.80001 9.48329 1.76855ZM10.6229 1.8125C10.6466 1.82351 10.6695 1.8354 10.6923 1.84766C10.6697 1.83492 10.6462 1.82398 10.6229 1.8125Z"
          fill={`url(#${id("g5")})`}
        />
        <ellipse cx="4.00278" cy="6.54424" rx="1.40708" ry="1.41045" fill="#004BEF" />
      </g>
      <defs>
        <linearGradient id={id("g0")} x1="16.7635" y1="6.29136" x2="10.3689" y2="2.65965" gradientUnits="userSpaceOnUse">
          <stop stopColor="#001656" />
          <stop offset="1" stopColor="#245BFF" />
        </linearGradient>
        <linearGradient id={id("g1")} x1="16.5775" y1="6.0229" x2="16.4675" y2="14.3651" gradientUnits="userSpaceOnUse">
          <stop stopColor="#245BFF" />
          <stop offset="1" stopColor="#001656" />
        </linearGradient>
        <linearGradient id={id("g2")} x1="9.48794" y1="17.5579" x2="15.8609" y2="13.6243" gradientUnits="userSpaceOnUse">
          <stop stopColor="#001656" />
          <stop offset="1" stopColor="#245BFF" />
        </linearGradient>
        <linearGradient id={id("g3")} x1="1.97035" y1="14.1794" x2="10.3661" y2="18.0537" gradientUnits="userSpaceOnUse">
          <stop stopColor="#001656" />
          <stop offset="1" stopColor="#245BFF" />
        </linearGradient>
        <linearGradient id={id("g4")} x1="1.92528" y1="6.1216" x2="6.33675" y2="13.7442" gradientUnits="userSpaceOnUse">
          <stop stopColor="#001656" />
          <stop offset="1" stopColor="#245BFF" />
        </linearGradient>
        <linearGradient id={id("g5")} x1="10.2589" y1="2.28041" x2="3.93744" y2="7.14902" gradientUnits="userSpaceOnUse">
          <stop stopColor="#001656" />
          <stop offset="1" stopColor="#245BFF" />
        </linearGradient>
        <clipPath id={id("clip")}>
          <rect width="16.6667" height="16.6667" fill="white" transform="translate(1.66602 1.66699)" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const HistoryIcon = ({ size = 22, color = "currentColor" }) => (
  <MaterialPath
    size={size}
    color={color}
    d="M480-120q-138 0-240.5-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z"
  />
);

// Tune / sliders — used by the Graph chip.
export const TuneIcon = ({ size = 18, color = "currentColor" }) => (
  <MaterialPath
    size={size}
    color={color}
    d="M440-120v-240h80v80h320v80H520v80h-80Zm-320-80v-80h240v80H120Zm160-160v-80H120v-80h160v-80h80v240h-80Zm160-80v-80h400v80H440Zm160-160v-240h80v80h160v80H680v80h-80Zm-480-80v-80h400v80H120Z"
  />
);

// Filter funnel — used by the Setup Context chip.
export const FilterFunnelIcon = ({ size = 18, color = "currentColor" }) => (
  <MaterialPath
    size={size}
    color={color}
    d="M440-160q-17 0-28.5-11.5T400-200v-240L168-736q-15-20-4.5-42t36.5-22h560q26 0 36.5 22t-4.5 42L560-440v240q0 17-11.5 28.5T520-160h-80Z"
  />
);

// Arrow up — used by the composer send button.
export const ArrowUpIcon = ({ size = 18, color = "currentColor" }) => (
  <MaterialPath
    size={size}
    color={color}
    d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z"
  />
);
