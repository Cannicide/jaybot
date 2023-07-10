import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Ranks from './pages/Ranks';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="ranks" element={<Ranks />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
