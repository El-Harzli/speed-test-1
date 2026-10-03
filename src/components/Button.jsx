import { Link } from "react-router";

function Button({
  variant = "primary",
  label,
  customCss,
  isBaseActive = true,
  to,
  onClick,
  type = "button",
  ...rest
}) {
  const base =
    "text-sm sm:text-base font-medium whitespace-nowrap rounded-xl sm:rounded-2xl px-6 py-3 min-h-[44px] sm:min-h-[48px] lg:min-h-[52px] cursor-pointer transition-all duration-300";

  const variants = {
    primary: `
      bg-accent-500 
      text-white 
      border border-accent-500 
      shadow-sm
      hover:bg-accent-600 
      hover:border-accent-600 
    `,
    outline: `
      text-accent-500 
      border border-accent-500
      hover:bg-accent-500
      hover:text-white
    `,
  };

  const className = `${isBaseActive ? base : ""} ${
    variants[variant]
  } ${customCss}`;

  if (to) {
    return (
      <Link to={to} className={className} {...rest}>
        {label}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      {...rest}
    >
      {label}
    </button>
  );
}

export default Button;