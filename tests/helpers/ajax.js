// Quick'n'dirty AJAX without using `fetch` (needs Pretender support)
// or `jQuery` (don't want to assume it's around)
export default function ajax(url, { method = 'GET' } = {}) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.onload = () => resolve(JSON.parse(request.responseText));
    request.onerror = () => reject();
    request.open(method, url);
    request.send();
  });
}
