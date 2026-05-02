interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

const Button: React.FC<Props> = ({
  variant = "primary",
  className = "",
  ...props
}) => {
  const base = "px-4 py-2 rounded-lg font-medium transition";

  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props} />
  );
};

export default Button;