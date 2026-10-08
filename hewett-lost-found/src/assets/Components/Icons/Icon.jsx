const iconPaths = {
  check: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-4-10 2.5 2.5L16.5 9",
  help: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-3-13a3 3 0 1 1 5.1 2.1c-1.2 1.2-2.1 1.4-2.1 3.4m0 3h.01",
  login: "M10 17l5-5-5-5m5 5H3m9-9h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6",
  mail: "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm18 2-10 7L2 7",
  plus: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-15v10m-5-5h10",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm6-2 5 5",
};

const Icon = ({ name, size = 20 }) => (
  <svg
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    focusable="false"
  >
    {name === "brand" ? (
      <g stroke="currentColor" strokeWidth="2">
        <path
          fill="currentColor"
          fillOpacity="0"
          strokeDasharray="40"
          d="M10.76 13.24c-2.34-2.34-2.34-6.14 0-8.49c2.34-2.34 6.14-2.34 8.49 0c2.34 2.34 2.34 6.14 0 8.49c-2.34 2.34-6.14 2.34-8.49 0Z"
        >
          <animate
            attributeName="stroke-dashoffset"
            dur="0.5s"
            values="40;0"
            fill="freeze"
          />
          <animate
            attributeName="fill-opacity"
            begin="0.7s"
            dur="0.4s"
            to="1"
            fill="freeze"
          />
        </path>
        <path
          fill="none"
          strokeDasharray="14"
          strokeDashoffset="14"
          d="m10.5 13.5-7.5 7.5"
        >
          <animate
            attributeName="stroke-dashoffset"
            begin="0.5s"
            dur="0.2s"
            to="0"
            fill="freeze"
          />
        </path>
      </g>
    ) : name === "home" ? (
      <g fill="currentColor" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274" />
        <path d="M15 18H9" />
      </g>
    ) : (
      <path d={iconPaths[name]} />
    )}
  </svg>
);

export default Icon;
