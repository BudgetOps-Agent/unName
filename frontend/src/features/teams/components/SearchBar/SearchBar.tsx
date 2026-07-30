import styles from './searchbar.module.css';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
    return (
        <div className={styles.searchbarContainer}>
            <img src="/search.svg" alt="검색" />
            <input
                className={styles.searchKeyword}
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="찾고 싶은 지출을 검색해 보세요"
            />
        </div>
    )
}

export default SearchBar