import './CustomerLayout.css'

// Shared frame of the customer dashboard: logo, header, sidebar, and the message line.
function CustomerLayout({ page, go, title, subtitle, name, message, children }) {
  return (
    <div className="app">
      <div className="logo">
        <svg viewBox="0 0 100 150"><path d="M50 4C50 4 8 62 8 100a42 42 0 0 0 84 0C92 62 50 4 50 4z" fill="#27a8e1" /></svg>
        <span className="gk">GK</span><span className="rs">REFILLING STATION</span>
      </div>

      <header className="header">
        <div className="title"><b>{title}</b><small>{subtitle}</small></div>
        <div className="user">
          <svg viewBox="0 0 64 64" fill="none" stroke="#fff" strokeWidth="4"><circle cx="32" cy="18" r="11" /><path d="M8 58c0-14 10-22 24-22s24 8 24 22z" /></svg>
          <div>Name:<br /><span>{name}</span></div>
        </div>
      </header>

      <aside className="sidebar">
        <button className={'menu' + (page === 'order' ? ' active' : '')} onClick={() => go('order')}>
          <svg viewBox="0 0 64 64" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round"><rect x="8" y="6" width="38" height="50" rx="4" /><path d="M15 17h6M25 17h15M15 27h6M25 27h15M15 37h6M25 37h8" /></svg>
          Order water
        </button>
        <button className={'menu' + (page === 'profile' ? ' active' : '')} onClick={() => go('profile')}>
          <svg viewBox="0 0 64 64" fill="none" stroke="#fff" strokeWidth="3.5"><circle cx="32" cy="18" r="11" /><path d="M8 58c0-14 10-22 24-22s24 8 24 22z" /></svg>
          Profile
        </button>
        {/* Log out: connect this to your login page */}
        <button className="logout" onClick={() => alert('You are logged out. Connect this button to your login page.')}>
          <svg viewBox="0 0 64 64" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M26 8H12v48h14M24 32h34M46 20l12 12-12 12" /></svg>
          LOG OUT
        </button>
      </aside>

      <main>
        <p id="message" role="alert" className={message.type}>{message.text}</p>
        {children}
      </main>
    </div>
  )
}

export default CustomerLayout
