
import Header from './Header.jsx';
import Main from './Main.jsx';
import './App.css';

function App() {

  return (
    <div
      id='id_App'
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: "space-between",
        // height: "100vh",
        // height: document.documentElement.clientHeight, // испотзуем \тот параметр установки высоты, иначе в мобильном телефоне не корректно отображает высоту, не учитываем адресную строку
        height: window.innerHeight + "px",
        // width: "100vw",
        width: document.documentElement.clientWidth + "px",
        // margin: 0,
        // padding: 0,
        // overflow: "hidden",
        // border: "solid 4px red",
        // blockSize: "border-box",
      }}
    >
      <Header />
      <Main />


    </div>
  );
}

export default App;
