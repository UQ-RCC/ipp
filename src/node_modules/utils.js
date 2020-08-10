export function post(endpoint, data) {
	return fetch(endpoint, {
		method: 'POST',
		credentials: 'include',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(r => r.json());
}


export function get(endpoint) {
	return fetch(endpoint, {
		method: 'GET',
		headers: {
		}
	}).then(r => r.json());
}