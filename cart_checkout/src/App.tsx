
import './App.css'
import Header from './components/header/Header'
import Content from './pages/Content'


function App() {
  return (
    <>
      <Header />
      <div className='content-wrapper'>
        <Content />
      </div>
    </>
  )
}

export default App
