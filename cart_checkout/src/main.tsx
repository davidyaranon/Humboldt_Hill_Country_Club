import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom';
import { ContextProvider } from './my-context.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ContextProvider>
    <Router>
      <App />
    </Router>
  </ContextProvider>
  ,
)
