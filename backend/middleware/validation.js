const VALID_STATUSES = ['Applied', 'Interviewing', 'Hired', 'Rejected'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-\+\(\)]{7,20}$/;

function validateCandidate(body, isUpdate = false) {
  const errors = [];

  if (!isUpdate || body.name !== undefined) {
    const name = (body.name || '').toString().trim();
    if (!name) errors.push({ field: 'name', message: 'Name is required' });
    else if (name.length > 255) errors.push({ field: 'name', message: 'Name must be at most 255 characters' });
  }

  if (!isUpdate || body.age !== undefined) {
    const age = body.age;
    if (age === undefined || age === null || age === '') {
      if (!isUpdate) errors.push({ field: 'age', message: 'Age is required' });
    } else {
      const n = parseInt(age, 10);
      if (isNaN(n)) errors.push({ field: 'age', message: 'Age must be a number' });
      else if (n < 18 || n > 120) errors.push({ field: 'age', message: 'Age must be between 18 and 120' });
    }
  }

  if (!isUpdate || body.email !== undefined) {
    const email = (body.email || '').toString().trim();
    if (!email) errors.push({ field: 'email', message: 'Email is required' });
    else if (!EMAIL_REGEX.test(email)) errors.push({ field: 'email', message: 'Invalid email format' });
    else if (email.length > 255) errors.push({ field: 'email', message: 'Email must be at most 255 characters' });
  }

  if (body.phone !== undefined && body.phone !== null && body.phone !== '') {
    const phone = (body.phone || '').toString().trim();
    if (phone && !PHONE_REGEX.test(phone)) errors.push({ field: 'phone', message: 'Invalid phone format' });
  }

  if (body.status !== undefined && body.status !== null && body.status !== '') {
    const status = (body.status || '').toString().trim();
    if (status && !VALID_STATUSES.includes(status)) {
      errors.push({ field: 'status', message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }
  }

  return errors;
}

module.exports = { validateCandidate, VALID_STATUSES };
