import './Profile.css'
import { useState } from 'react'


const API = 'http://localhost:5000/api/customer'


function serverDown() {
  throw new Error('Cannot reach the server. Start the backend first.')
}


async function request(path, method, body) {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(serverDown)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Something went wrong.')
  return data
}


function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}


function Row({ label, value }) {
  return <p>{label} <span>{value}</span></p>
}


function Field({ id, label, value, onChange, type = 'text' }) {
  return <><label htmlFor={id}>{label}</label><input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} /></>
}


function Modal({ open, title, error, onSubmit, onClose, submitText, children }) {
  return (
    <div className={'overlay' + (open ? ' open' : '')}>
      <form className="card modal" onSubmit={onSubmit}>
        <h2>{title}</h2>
        <p className="modal-msg" role="alert">{error}</p>
        {children}
        <button className="btn" type="submit">{submitText}</button>
        <button className="btn gray" type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  )
}


function Profile({ customer: c, setCustomer, showMessage }) {
  const [modal, setModal] = useState(null) // null | 'edit' | 'pw'
  const [modalError, setModalError] = useState('')
  const [edit, setEdit] = useState({ name: '', phone: '', address: '' })
  const [pw, setPw] = useState({ current: '', next: '', again: '' })


  function close() { setModal(null); setModalError('') }
  function openEdit() { setEdit({ name: c.name, phone: c.phone, address: c.address }); setModal('edit') }
  function openPw() { setPw({ current: '', next: '', again: '' }); setModal('pw') }


  // change photo (resized to a small square before it is sent to the backend)
  function changePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = async () => {
        const size = 240, side = Math.min(img.width, img.height)
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = size
        canvas.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
        try {
          setCustomer(await request('/photo', 'PUT', { photo: canvas.toDataURL('image/jpeg', 0.8) }))
          showMessage({ text: 'Your photo was changed.', type: 'success' })
        } catch (err) {
          showMessage({ text: err.message, type: 'error' })
        }
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }


  async function saveEdit(e) {
    e.preventDefault()
    try {
      setCustomer(await request('', 'PUT', edit))
      close()
      showMessage({ text: 'Your profile was updated.', type: 'success' })
    } catch (err) {
      setModalError(err.message)
    }
  }


  async function savePw(e) {
    e.preventDefault()
    if (pw.next.length < 6) return setModalError('Use a password with at least 6 characters.')
    if (pw.next !== pw.again) return setModalError('The new passwords do not match.')
    try {
      await request('/password', 'PUT', { current: pw.current, next: pw.next })
      close()
      showMessage({ text: 'Your password was changed.', type: 'success' })
    } catch (err) {
      setModalError(err.message)
    }
  }


  return (
    <>
      <div className="profile-grid">
        <div>
          <h2 className="ptitle">
            <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="none" stroke="#10447f" strokeWidth="3" /><circle cx="32" cy="25" r="10" fill="#10447f" /><path d="M12 54c2-12 10-17 20-17s18 5 20 17z" fill="#10447f" /></svg>
            My Profile
          </h2>
          <div className="stack">
            <div className="card photo-card">
              <span>
                {c.photo
                  ? <img className="avatar" alt="Profile photo" src={c.photo} />
                  : <span className="avatar"><svg viewBox="0 0 64 64"><circle cx="32" cy="24" r="12" fill="#fff" /><path d="M6 64c0-20 12-28 26-28s26 8 26 28z" fill="#fff" /></svg></span>}
              </span><br />
              <label className="btn" htmlFor="photoInput">change photo</label>
              <input id="photoInput" type="file" accept="image/*" hidden onChange={changePhoto} />
            </div>


            <div className="card">
              <div className="hd">
                <svg viewBox="0 0 64 64" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinejoin="round"><path d="M32 4L8 14v16c0 16 10 26 24 30 14-4 24-14 24-30V14z" /></svg>
                Account Details
              </div>
              <div className="rows">
                <Row label="Username :" value={c.username} />
                <Row label="Role :" value="Customer" />
                <Row label="Status :" value={c.status} />
              </div>
            </div>
          </div>
        </div>


        <div className="stack">
          <div className="card">
            <div className="hd">
              <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#fff" /><circle cx="32" cy="25" r="10" fill="#10447f" /><path d="M12 54c2-12 10-17 20-17s18 5 20 17z" fill="#10447f" /></svg>
              Personal Info.
            </div>
            <div className="rows">
              <Row label="Fullname:" value={c.name} />
              <Row label="Customer ID:" value={String(c.id).padStart(4, '0')} />
              <Row label="Address:" value={c.address} />
              <Row label="Contact No.:" value={c.phone} />
              <Row label="Member since:" value={formatDate(c.since)} />
            </div>
          </div>


          <div className="card actions">
            <button className="btn dark" type="button" onClick={openEdit}>Edit Profile</button>
            <button className="btn dark" type="button" onClick={openPw}>Change Password</button>
          </div>
        </div>
      </div>


      <Modal open={modal === 'edit'} title="Edit Profile" error={modalError} onSubmit={saveEdit} onClose={close} submitText="Save">
        <Field id="eName" label="Full name" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} />
        <Field id="ePhone" label="Contact No." value={edit.phone} onChange={(v) => setEdit({ ...edit, phone: v })} />
        <Field id="eAddress" label="Address" value={edit.address} onChange={(v) => setEdit({ ...edit, address: v })} />
      </Modal>


      <Modal open={modal === 'pw'} title="Change Password" error={modalError} onSubmit={savePw} onClose={close} submitText="Update Password">
        <Field id="pwCurrent" type="password" label="Current password" value={pw.current} onChange={(v) => setPw({ ...pw, current: v })} />
        <Field id="pwNew" type="password" label="New password" value={pw.next} onChange={(v) => setPw({ ...pw, next: v })} />
        <Field id="pwAgain" type="password" label="Confirm new password" value={pw.again} onChange={(v) => setPw({ ...pw, again: v })} />
      </Modal>
    </>
  )
}


export default Profile
