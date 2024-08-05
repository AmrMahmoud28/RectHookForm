import { useSelector } from "react-redux";
import LoginForm from "./components/LoginForm";
import { selectUser } from "./redux/slices/LoginSlice";
import Home from "./pages/Home";

const App = () => {
  const user = useSelector(selectUser);
  return user? <Home /> : <LoginForm />;
};

export default App;