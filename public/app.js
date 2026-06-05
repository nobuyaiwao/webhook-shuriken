const webhookList = document.getElementById('webhook-list');
const webhookDetail = document.getElementById('webhook-detail');
const refreshButton = document.getElementById('refresh-button');
const clearFilterButton = document.getElementById('clear-filter-button');

const environmentFilter = document.getElementById('environment-filter');
const merchantFilter = document.getElementById('merchant-filter');
const eventCodeFilter = document.getElementById('event-code-filter');

function buildQueryParams() {
    const params = new URLSearchParams();

    if (environmentFilter.value) {
        params.append('environment', environmentFilter.value);
    }

    if (merchantFilter.value) {
        params.append('merchantAccount', merchantFilter.value);
    }

    if (eventCodeFilter.value) {
        params.append('eventCode', eventCodeFilter.value);
    }

    return params.toString();
}

async function fetchFilterOptions() {
    const response = await fetch('/api/filter-options');
    const options = await response.json();

    populateSelect(environmentFilter, options.environments);
    populateSelect(merchantFilter, options.merchantAccounts);
    populateSelect(eventCodeFilter, options.eventCodes);
}

function populateSelect(selectElement, values) {
    const currentValue = selectElement.value;

    selectElement.innerHTML = '<option value="">ALL</option>';

    values.forEach(value => {
        if (!value) {
            return;
        }

        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        selectElement.appendChild(option);
    });

    selectElement.value = currentValue;
}

async function fetchWebhooks() {
    const query = buildQueryParams();
    const url = query ? `/api/webhooks?${query}` : '/api/webhooks';

    const response = await fetch(url);
    const webhooks = await response.json();

    renderWebhookList(webhooks);
}

function renderWebhookList(webhooks) {
    webhookList.innerHTML = '';

    if (webhooks.length === 0) {
        webhookList.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">No webhooks found.</td>
            </tr>
        `;
        return;
    }

    webhooks.forEach(webhook => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${webhook.receivedAt || ''}</td>
            <td>${webhook.environment || ''}</td>
            <td>${webhook.merchantAccount || ''}</td>
            <td>${webhook.eventCode || ''}</td>
            <td>${webhook.pspReference || ''}</td>
            <td>${webhook.success || ''}</td>
        `;

        row.addEventListener('click', () => fetchWebhookDetail(webhook.id));

        webhookList.appendChild(row);
    });
}

//async function fetchWebhookDetail(id) {
//    const response = await fetch(`/api/webhooks/${id}`);
//    const webhook = await response.json();
//
//    webhookDetail.textContent = JSON.stringify(webhook.body, null, 2);
//}
async function fetchWebhookDetail(id) {
    const response = await fetch(`/api/webhooks/${id}`);
    const webhook = await response.json();

    webhookDetail.innerHTML =
        syntaxHighlightJson(webhook.body);
}

function clearFilters() {
    environmentFilter.value = '';
    merchantFilter.value = '';
    eventCodeFilter.value = '';

    fetchWebhooks();
}

async function refreshViewer() {
    await fetchFilterOptions();
    await fetchWebhooks();
}

refreshButton.addEventListener('click', refreshViewer);
clearFilterButton.addEventListener('click', clearFilters);

environmentFilter.addEventListener('change', fetchWebhooks);
merchantFilter.addEventListener('change', fetchWebhooks);
eventCodeFilter.addEventListener('change', fetchWebhooks);

refreshViewer();

function syntaxHighlightJson(json) {
    json = JSON.stringify(json, null, 2);

    json = json
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    return json.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        match => {
            let className = 'json-number';

            if (/^"/.test(match)) {
                className = /:$/.test(match)
                    ? 'json-key'
                    : 'json-string';
            } else if (/true|false/.test(match)) {
                className = 'json-boolean';
            } else if (/null/.test(match)) {
                className = 'json-null';
            }

            return `<span class="${className}">${match}</span>`;
        }
    );
}
