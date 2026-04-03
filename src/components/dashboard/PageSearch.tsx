import Icon from "./Icon";

interface PageSearchProps {
  value: string;
  onChange: (nextValue: string) => void;
  placeholder: string;
}

export default function PageSearch({
  value,
  onChange,
  placeholder,
}: PageSearchProps) {
  return (
    <label className="page-search">
      <span className="page-search__icon" aria-hidden="true">
        <Icon name="search" size={18} />
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
