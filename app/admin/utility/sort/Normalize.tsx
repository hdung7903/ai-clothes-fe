function Normalize(value: any) {
    // chuẩn hóa để so sánh: xử lý number, string, giá "$49.99", boolean
    if (typeof value === "number") return value;
    if (typeof value === "boolean") return value ? 1 : 0;
    if (typeof value === "string") {
        // nếu là giá kiểu "$1,234.56"
        const maybePrice = value.replace(/[$,]/g, "");
        const num = Number(maybePrice);
        if (!Number.isNaN(num) && /[\d.]/.test(maybePrice)) return num;
        return value.toLowerCase();
    }
    return value ?? ""; // null/undefined
}
export default Normalize