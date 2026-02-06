// Use same origin when served from server; fallback to localhost when opened as file://
const API_BASE =
  typeof window !== 'undefined' &&
  window.location.origin &&
  (window.location.origin.startsWith('http://') || window.location.origin.startsWith('https://'))
    ? `${window.location.origin}/api`
    : 'http://localhost:3000/api';

const elements = {
  tableBody: document.getElementById('tableBody'),
  emptyRow: document.getElementById('emptyRow'),
  btnAdd: document.getElementById('btnAdd'),
  search: document.getElementById('search'),
  filterStatus: document.getElementById('filterStatus'),
  modalOverlay: document.getElementById('modalOverlay'),
  modal: document.getElementById('modal'),
  modalTitle: document.getElementById('modalTitle'),
  modalClose: document.getElementById('modalClose'),
  candidateForm: document.getElementById('candidateForm'),
  candidateId: document.getElementById('candidateId'),
  btnCancel: document.getElementById('btnCancel'),
  btnSubmit: document.getElementById('btnSubmit'),
  deleteModalOverlay: document.getElementById('deleteModalOverlay'),
  deleteModal: document.getElementById('deleteModal'),
  deleteModalMessage: document.getElementById('deleteModalMessage'),
  btnDeleteCancel: document.getElementById('btnDeleteCancel'),
  btnDeleteConfirm: document.getElementById('btnDeleteConfirm'),
  toast: document.getElementById('toast'),
};

const errorIds = {
  name: 'errorName',
  age: 'errorAge',
  email: 'errorEmail',
  phone: 'errorPhone',
};

let deleteTargetId = null;
let searchDebounce = null;

function showToast(message, type = 'success') {
  elements.toast.textContent = message;
  elements.toast.className = 'toast ' + type + ' show';
  clearTimeout(elements.toast._timeout);
  elements.toast._timeout = setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 3500);
}

function setModalOpen(open) {
  elements.modalOverlay.setAttribute('aria-hidden', !open);
  if (open) {
    elements.modal.focus();
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

function setDeleteModalOpen(open) {
  elements.deleteModalOverlay.setAttribute('aria-hidden', !open);
  if (open) document.body.style.overflow = 'hidden';
  else document.body.style.overflow = '';
}

function clearFormErrors() {
  Object.keys(errorIds).forEach((key) => {
    const el = document.getElementById(errorIds[key]);
    if (el) el.textContent = '';
  });
  document.querySelectorAll('.form-group input.invalid').forEach((i) => i.classList.remove('invalid'));
}

function showFieldErrors(errors) {
  clearFormErrors();
  (errors || []).forEach(({ field, message }) => {
    const errEl = document.getElementById(errorIds[field] || `error${field}`);
    const inputEl = document.getElementById(field) || document.querySelector(`[name="${field}"]`);
    if (errEl) errEl.textContent = message;
    if (inputEl) inputEl.classList.add('invalid');
  });
}

function validateForm() {
  const name = elements.candidateForm.name.value.trim();
  const age = elements.candidateForm.age.value;
  const email = elements.candidateForm.email.value.trim();
  const phone = elements.candidateForm.phone.value.trim();
  const errors = [];

  if (!name) errors.push({ field: 'name', message: 'Name is required' });
  if (!age || isNaN(parseInt(age, 10))) errors.push({ field: 'age', message: 'Valid age is required' });
  else {
    const a = parseInt(age, 10);
    if (a < 18 || a > 120) errors.push({ field: 'age', message: 'Age must be between 18 and 120' });
  }
  if (!email) errors.push({ field: 'email', message: 'Email is required' });
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push({ field: 'email', message: 'Invalid email format' });
  if (phone && !/^[\d\s\-\+\(\)]{7,20}$/.test(phone)) errors.push({ field: 'phone', message: 'Invalid phone format' });

  if (errors.length) showFieldErrors(errors);
  return errors.length === 0;
}

function realtimeValidation(field) {
  const name = elements.candidateForm.name.value.trim();
  const age = elements.candidateForm.age.value;
  const email = elements.candidateForm.email.value.trim();
  const phone = elements.candidateForm.phone.value.trim();
  const errors = [];

  if (field === 'name') {
    if (!name) errors.push({ field: 'name', message: 'Name is required' });
    else document.getElementById('errorName').textContent = '';
  }
  if (field === 'age') {
    if (!age || isNaN(parseInt(age, 10))) errors.push({ field: 'age', message: 'Age is required' });
    else {
      const a = parseInt(age, 10);
      if (a < 18 || a > 120) errors.push({ field: 'age', message: 'Age must be 18–120' });
    }
  }
  if (field === 'email') {
    if (!email) errors.push({ field: 'email', message: 'Email is required' });
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push({ field: 'email', message: 'Invalid email' });
    else document.getElementById('errorEmail').textContent = '';
  }
  if (field === 'phone' && phone && !/^[\d\s\-\+\(\)]{7,20}$/.test(phone)) errors.push({ field: 'phone', message: 'Invalid phone' });
  if (errors.length) showFieldErrors(errors);
}

async function fetchCandidates() {
  const search = elements.search.value.trim();
  const status = elements.filterStatus.value;
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  const url = `${API_BASE}/candidates${params.toString() ? '?' + params : ''}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Failed to load candidates (${res.status})`);
  return data.candidates || [];
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { dateStyle: 'short' });
}

function renderTable(candidates) {
  if (candidates.length === 0) {
    elements.emptyRow.innerHTML = '<td colspan="9">No candidates found. Add one or adjust filters.</td>';
    elements.emptyRow.classList.add('empty-row');
    elements.emptyRow.style.display = '';
    return;
  }
  elements.emptyRow.style.display = 'none';
  elements.tableBody.innerHTML = candidates
    .map(
      (c) => `
    <tr>
      <td>${escapeHtml(c.name || '—')}</td>
      <td>${c.age != null ? escapeHtml(String(c.age)) : '—'}</td>
      <td>${escapeHtml(c.email || '—')}</td>
      <td>${escapeHtml(c.phone || '—')}</td>
      <td>${escapeHtml((c.skills || '').slice(0, 50))}${(c.skills || '').length > 50 ? '…' : ''}</td>
      <td>${escapeHtml(c.experience || '—')}</td>
      <td>${escapeHtml(c.applied_position || '—')}</td>
      <td><span class="status-badge status-${escapeHtml(c.status || 'Applied')}">${escapeHtml(c.status || 'Applied')}</span></td>
      <td class="actions-cell">
        <button type="button" class="btn btn-secondary btn-sm" data-action="edit" data-id="${c.id}">Edit</button>
        <button type="button" class="btn btn-danger btn-sm" data-action="delete" data-id="${c.id}">Delete</button>
      </td>
    </tr>`
    )
    .join('');

  elements.tableBody.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener('click', () => openEdit(parseInt(btn.dataset.id, 10)));
  });
  elements.tableBody.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => openDeleteConfirm(parseInt(btn.dataset.id, 10)));
  });
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

async function loadTable() {
  try {
    const candidates = await fetchCandidates();
    renderTable(candidates);
  } catch (e) {
    const msg = e.message || 'Unable to load candidates.';
    elements.emptyRow.innerHTML = `<td colspan="9">${escapeHtml(msg)}<br><small>Ensure the server is running and the database is set up (npm run init-db).</small></td>`;
    elements.emptyRow.classList.add('empty-row');
    elements.emptyRow.style.display = '';
    console.error(e);
  }
}

function openAdd() {
  elements.modalTitle.textContent = 'Add Candidate';
  elements.candidateId.value = '';
  elements.candidateForm.reset();
  clearFormErrors();
  setModalOpen(true);
}

async function openEdit(id) {
  try {
    const res = await fetch(`${API_BASE}/candidates/${id}`);
    if (!res.ok) throw new Error('Failed to load candidate');
    const c = await res.json();
    elements.modalTitle.textContent = 'Edit Candidate';
    elements.candidateId.value = c.id;
    elements.candidateForm.name.value = c.name || '';
    elements.candidateForm.age.value = c.age ?? '';
    elements.candidateForm.email.value = c.email || '';
    elements.candidateForm.phone.value = c.phone || '';
    elements.candidateForm.skills.value = c.skills || '';
    elements.candidateForm.experience.value = c.experience ?? '';
    elements.candidateForm.applied_position.value = c.applied_position || '';
    elements.candidateForm.status.value = c.status || 'Applied';
    clearFormErrors();
    setModalOpen(true);
  } catch (e) {
    showToast('Could not load candidate', 'error');
  }
}

function openDeleteConfirm(id) {
  deleteTargetId = id;
  elements.deleteModalMessage.textContent = 'Are you sure you want to delete this candidate? This cannot be undone.';
  setDeleteModalOpen(true);
}

async function submitDelete() {
  if (!deleteTargetId) return;
  try {
    const res = await fetch(`${API_BASE}/candidates/${deleteTargetId}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Delete failed');
    }
    showToast('Candidate deleted');
    setDeleteModalOpen(false);
    deleteTargetId = null;
    loadTable();
  } catch (e) {
    showToast(e.message || 'Delete failed', 'error');
  }
}

async function submitForm(e) {
  e.preventDefault();
  if (!validateForm()) return;
  const id = elements.candidateId.value;
  const payload = {
    name: elements.candidateForm.name.value.trim(),
    age: parseInt(elements.candidateForm.age.value, 10),
    email: elements.candidateForm.email.value.trim(),
    phone: elements.candidateForm.phone.value.trim() || null,
    skills: elements.candidateForm.skills.value.trim() || null,
    experience: elements.candidateForm.experience.value.trim() || null,
    applied_position: elements.candidateForm.applied_position.value.trim() || null,
    status: elements.candidateForm.status.value || 'Applied',
  };
  try {
    const url = id ? `${API_BASE}/candidates/${id}` : `${API_BASE}/candidates`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (data.errors && Array.isArray(data.errors)) showFieldErrors(data.errors);
      else showToast(data.error || 'Request failed', 'error');
      return;
    }
    showToast(id ? 'Candidate updated' : 'Candidate added');
    setModalOpen(false);
    loadTable();
  } catch (e) {
    showToast('Request failed', 'error');
  }
}

function onSearch() {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(loadTable, 280);
}

elements.btnAdd.addEventListener('click', openAdd);
elements.modalClose.addEventListener('click', () => setModalOpen(false));
elements.btnCancel.addEventListener('click', () => setModalOpen(false));
elements.modalOverlay.addEventListener('click', (e) => {
  if (e.target === elements.modalOverlay) setModalOpen(false);
});
elements.candidateForm.addEventListener('submit', submitForm);

['name', 'age', 'email', 'phone'].forEach((field) => {
  const el = elements.candidateForm[field];
  if (el) el.addEventListener('blur', () => realtimeValidation(field));
});

elements.btnDeleteCancel.addEventListener('click', () => {
  setDeleteModalOpen(false);
  deleteTargetId = null;
});
elements.btnDeleteConfirm.addEventListener('click', submitDelete);
elements.deleteModalOverlay.addEventListener('click', (e) => {
  if (e.target === elements.deleteModalOverlay) setDeleteModalOpen(false);
});

elements.search.addEventListener('input', onSearch);
elements.filterStatus.addEventListener('change', loadTable);

loadTable();
