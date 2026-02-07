const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCandidate(body, isUpdate = false) {
  const errors = [];

  if (!isUpdate || body.s_roll !== undefined) {
    const sRoll = body.s_roll;
    if (sRoll !== undefined && sRoll !== null && sRoll !== '') {
      const n = parseInt(sRoll, 10);
      if (isNaN(n)) errors.push({ field: 's_roll', message: 'Roll must be a number' });
    }
  }

  if (!isUpdate || body.name !== undefined) {
    const name = (body.name || '').toString().trim();
    if (!name) errors.push({ field: 'name', message: 'Name is required' });
    else if (name.length > 100) errors.push({ field: 'name', message: 'Name must be at most 100 characters' });
  }

  if (!isUpdate || body.age !== undefined) {
    const age = body.age;
    if (age === undefined || age === null || age === '') {
      if (!isUpdate) errors.push({ field: 'age', message: 'Age is required' });
    } else {
      const n = parseInt(age, 10);
      if (isNaN(n)) errors.push({ field: 'age', message: 'Age must be a number' });
      else if (n < 1 || n > 120) errors.push({ field: 'age', message: 'Age must be between 1 and 120' });
    }
  }

  if (!isUpdate || body.email !== undefined) {
    const email = (body.email || '').toString().trim();
    if (!email) errors.push({ field: 'email', message: 'Email is required' });
    else if (!EMAIL_REGEX.test(email)) errors.push({ field: 'email', message: 'Invalid email format' });
    else if (email.length > 100) errors.push({ field: 'email', message: 'Email must be at most 100 characters' });
  }

  if (body.phone !== undefined && body.phone !== null && body.phone !== '') {
    const phone = body.phone;
    const n = parseInt(phone, 10);
    if (isNaN(n) || n < 0) errors.push({ field: 'phone', message: 'Phone must be a valid number' });
  }

  if (body.s_code !== undefined && body.s_code !== null && (body.s_code + '').length > 100) {
    errors.push({ field: 's_code', message: 'Code must be at most 100 characters' });
  }
  if (body.address !== undefined && body.address !== null && (body.address + '').length > 100) {
    errors.push({ field: 'address', message: 'Address must be at most 100 characters' });
  }
  if (body.course_name !== undefined && body.course_name !== null && (body.course_name + '').length > 100) {
    errors.push({ field: 'course_name', message: 'Course name must be at most 100 characters' });
  }

  return errors;
}

module.exports = { validateCandidate };
