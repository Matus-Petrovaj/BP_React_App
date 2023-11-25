import './App.css';
import Header from "./my_components/Header";
import Body from "./my_components/Body";
import Distance from "./my_components/Distance";

function App() {
    return (
        <div className="App">
            <Header/>
            <Body/>
            <div className="Elements">
                <Distance/>
            </div>
        </div>
    );
}

export default App;
