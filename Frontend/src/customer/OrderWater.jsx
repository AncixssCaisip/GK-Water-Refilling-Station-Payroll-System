import './OrderWater.css'
import { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api'
const blank = { driver: '', qty: '', pickup: '', delivery: '', landmark: '' }

function serverDown() {
  throw new Error('Cannot reach the server. Start the backend first.')
}

async function request(path, method = 'GET', body) {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }).catch(serverDown)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Something went wrong.')
  return data
}

function formatDate(iso) {
  return new Date(iso + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function OrderWater({ showMessage }) {
  const [drivers, setDrivers] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState(blank)

  useEffect(() => {
    request('/drivers').then(setDrivers).catch((e) => showMessage({ text: e.message, type: 'error' }))
    request('/orders').then(setOrders).catch((e) => showMessage({ text: e.message, type: 'error' }))
  }, [showMessage])

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    try {
      const order = await request('/orders', 'POST', { ...form, driverId: Number(form.driver), qty: Number(form.qty) })
      setOrders([order, ...orders])
      setForm(blank)
      showMessage({ text: 'Your order was placed.', type: 'success' })
    } catch (err) {
      showMessage({ text: err.message, type: 'error' })
    }
  }

  return (
    <>
      <form className="card pad" onSubmit={submit}>
        <h2>Available drivers</h2>

        <label htmlFor="driver">Driver</label>
        <select id="driver" value={form.driver} onChange={set('driver')}>
          <option value="">Choose a driver</option>
          {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>

        <label htmlFor="qty">Quantity (containers)</label>
        <input id="qty" type="number" min="1" step="1" value={form.qty} onChange={set('qty')} />

        <div className="row">
          <div><label htmlFor="pickup">Pickup address</label><input id="pickup" type="text" value={form.pickup} onChange={set('pickup')} /></div>
          <div><label htmlFor="delivery">Delivery address</label><input id="delivery" type="text" value={form.delivery} onChange={set('delivery')} /></div>
        </div>

        <label htmlFor="landmark">Landmark / Delivery instruction (optional)</label>
        <input id="landmark" type="text" maxLength="150" placeholder="Example: Near the barangay hall, blue gate"
          value={form.landmark} onChange={set('landmark')} />

        <button className="btn" type="submit">Place order</button>
      </form>

      <div className="table-box">
        <table>
          <thead>
            <tr><th>Date</th><th>Driver</th><th>Pickup address</th><th>Delivery address</th><th>Landmark / Instruction</th><th>Qty</th><th>Amount paid</th><th>Status</th></tr>
          </thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan="8" className="empty">You have no orders yet.</td></tr>}
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{formatDate(o.date)}</td><td>{o.driver}</td><td>{o.pickup}</td><td>{o.delivery}</td>
                <td>{o.landmark || '—'}</td><td>{o.qty}</td>
                <td>{o.amount ? '₱' + Number(o.amount).toFixed(2) : '—'}</td>
                <td><span className={'status ' + o.status.toLowerCase()}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default OrderWater
