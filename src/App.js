import logo from './logo.svg';
import './App.css';
import { GlCanvas } from './components/canvas';

function App() {
  return (
    <div className="App">
      {/*<header className="App-header">*/}
      {/*</header>*/}
      <GlCanvas/>
      <p>Canvas is above this</p>
    </div>
  );
}

export default App;
