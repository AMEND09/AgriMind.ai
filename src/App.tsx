import { Outlet } from 'react-router-dom';
import GeminiChatWidget from './components/GeminiChatWidget'; // Import the chat widget

function App() {
  return (
    <div>
      <header>
        {/* Add your header content here */}
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        {/*Application made by Aditya Mendiratta & Rahbe Abass for TSA Software Development 2025*/}
      </footer>
      <GeminiChatWidget /> {/* Add the chat widget here */}
    </div>
  );
}

export default App;
