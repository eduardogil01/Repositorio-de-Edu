const PHONE_KEY = 'party_attendees_v1';

const $ = sel => document.querySelector(sel);
const phoneInput = $('#phoneInput');
const findBtn = $('#findBtn');
const clearBtn = $('#clearBtn');
const result = $('#result');
const personInfo = $('#personInfo');
const register = $('#register');
const firstName = $('#firstName');
const lastName = $('#lastName');
const phoneReg = $('#phoneReg');
const role = $('#role');
const saveBtn = $('#saveBtn');
const cancelBtn = $('#cancelBtn');
const markAttBtn = $('#markAttBtn');
const editBtn = $('#editBtn');
const feedback = $('#feedback');
const feedbackText = $('#feedbackText');
const okFeedback = $('#okFeedback');

function loadDB(){
  try{
    return JSON.parse(localStorage.getItem(PHONE_KEY) || '{}');
  }catch(e){
    return {};
  }
}
function saveDB(db){
  localStorage.setItem(PHONE_KEY, JSON.stringify(db));
}

function normalizePhone(p){
  return (p||'').replace(/\D/g,'').slice(-10);
}

function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }

function showFeedback(msg){
  feedbackText.textContent = msg;
  show(feedback);
}

function clearAll(){
  phoneInput.value = '';
  firstName.value = lastName.value = phoneReg.value = role.value = '';
  hide(result); hide(register); hide(feedback);
}

function displayPerson(p){
  personInfo.innerHTML = `
    <div><strong>Nombre:</strong> ${p.firstName} ${p.lastName}</div>
    <div><strong>Teléfono:</strong> ${p.phone}</div>
    <div><strong>Rol:</strong> ${p.role}</div>
    <div class="small"><strong>Asistencias marcadas:</strong> ${p.attendance||0}</div>
  `;
  show(result);
  hide(register);
}

findBtn.addEventListener('click', ()=> {
  const phone = normalizePhone(phoneInput.value);
  if(phone.length !== 10){ showFeedback('Ingresa un número telefónico válido de 10 dígitos.'); return; }
  const db = loadDB();
  const person = db[phone];
  if(person){
    displayPerson(person);
  }else{
    // prompt to register with phone prefilled
    phoneReg.value = phone;
    show(register);
    hide(result);
    firstName.focus();
  }
});

clearBtn.addEventListener('click', ()=> clearAll());

saveBtn.addEventListener('click', ()=>{
  const fn = (firstName.value||'').trim();
  const ln = (lastName.value||'').trim();
  const ph = normalizePhone(phoneReg.value);
  const rl = (role.value||'').trim() || 'invitado';
  if(!fn || !ln || ph.length !== 10){
    showFeedback('Completa nombre, apellido y un teléfono válido de 10 dígitos.');
    return;
  }
  const db = loadDB();
  db[ph] = { firstName: fn, lastName: ln, phone: ph, role: rl, attendance: 0, createdAt: Date.now() };
  saveDB(db);
  showFeedback('Persona guardada correctamente.');
});

cancelBtn.addEventListener('click', ()=> {
  hide(register);
});

markAttBtn.addEventListener('click', ()=>{
  const phone = normalizePhone(phoneInput.value);
  const db = loadDB();
  const p = db[phone];
  if(!p){ showFeedback('Persona no encontrada.'); return; }
  p.attendance = (p.attendance||0) + 1;
  saveDB(db);
  displayPerson(p);
  showFeedback('Asistencia registrada.');
});

editBtn.addEventListener('click', ()=>{
  const phone = normalizePhone(phoneInput.value);
  const db = loadDB();
  const p = db[phone];
  if(!p){ showFeedback('Persona no encontrada.'); return; }
  firstName.value = p.firstName;
  lastName.value = p.lastName;
  phoneReg.value = p.phone;
  role.value = p.role;
  show(register);
});

okFeedback.addEventListener('click', ()=>{
  hide(feedback);
  clearAll();
});

// Quick use: Enter key on phone input triggers search
phoneInput.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter') findBtn.click();
});

// Keep phoneReg in sync when registering if user changes phone input earlier
phoneInput.addEventListener('input', ()=> {
  const normalized = normalizePhone(phoneInput.value);
  if(normalized.length <= 10) phoneReg.value = normalized;
});

// Start state
clearAll();