export interface Ward {
	name: string;
	mergedFrom: string[];
}

export interface ProvinceData {
	province: string;
	wards: Ward[];
}

type ProvincesApiResponse = {
	success: boolean;
	data: ProvinceData[];
};

const ENDPOINT = 'https://vietnamlabs.com/vietnamprovince';

export async function fetchVietnamProvinces(): Promise<ProvinceData[]> {
	const res = await fetch(ENDPOINT, {
		method: 'GET',
		headers: { Accept: 'application/json' },
		cache: 'no-store',
	});
	if (!res.ok) {
		throw new Error(`Failed to fetch provinces: ${res.status}`);
	}

	const json = (await res.json()) as ProvincesApiResponse | ProvinceData[];

	// API sometimes returns { success, data: [...] }
	if (Array.isArray(json)) {
		return json as ProvinceData[];
	}
	if (json && typeof json === 'object' && 'data' in json) {
		const payload = (json as ProvincesApiResponse).data;
		return Array.isArray(payload) ? payload : [];
	}

	return [];
}

export function extractProvinceNames(data: ProvinceData[]): string[] {
	return data.map((p) => p.province);
}

export function findProvince(data: ProvinceData[], provinceName: string | undefined): ProvinceData | undefined {
	if (!provinceName) return undefined;
	return data.find((p) => p.province === provinceName);
}









