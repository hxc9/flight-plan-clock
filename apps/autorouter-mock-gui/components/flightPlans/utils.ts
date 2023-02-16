const baseUrl = process.env.NEXT_PUBLIC_AR_MOCK_GUI_BASE_PATH??''

export function fetchFromMock(uri: string, init?: RequestInit) : Promise<Response> {
  return fetch(baseUrl + uri, init)
}