import './App.css'
import { useEffect, useState } from 'react'
import CustomerLayout from './customer/CustomerLayout.jsx'
import OrderWater from './customer/OrderWater.jsx'
import Profile from './customer/Profile.jsx'

// shown while the server has not answered yet (or is not running)
const emptyCustomer = { id: 0, name: '', phone: '', address: '', username: '', status: '', since: '', photo: null }

function App() {
  const [page, setPage] = useState('order') // 'order' | 'profile'
  const [customer, setCustomer] = useState(null)
  const [message, setMessage] = useState({})

  useEffect(() => {
    fetch('http://localhost:5000/api/customer')
      .then((res) => res.json())
      .then(setCustomer)
      .catch(() => setMessage({ text: 'Cannot reach the server. Start the backend first.', type: 'error' }))
  }, [])

  function go(next) {
    setMessage({})
    setPage(next)
  }

  const title = page === 'order' ? 'Order water' : 'My Profile'
  const subtitle = page === 'order'
    ? `Hello, ${customer ? customer.name.split(' ')[0] : 'Customer'}. Pick a driver who is available now.`
    : 'Your account and personal information'

  return (
    <CustomerLayout page={page} go={go} title={title} subtitle={subtitle} name={customer ? customer.name : 'Customer'} message={message}>
      {page === 'order' && <OrderWater showMessage={setMessage} />}
      {page === 'profile' && <Profile customer={customer || emptyCustomer} setCustomer={setCustomer} showMessage={setMessage} />}
    </CustomerLayout>
  )
}

export default App
