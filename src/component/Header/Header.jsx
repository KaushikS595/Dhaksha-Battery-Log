import { useNavigate } from "react-router-dom";
import logo from "../../assets/Dhaksha-Logo-03.png"; // Make sure the path is correct

function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-black text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        {/* Logo & Brand */}
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src={logo}
            alt="Dhaksha Drones Logo"
            className="h-14 w-auto object-contain" // ⬅️ slightly taller logo
          />
          <div>
            <h1 className="text-xl font-semibold tracking-wide uppercase">
              Dhaksha Unmanned Systems Pvt Ltd.
            </h1>
            <p className="text-sm text-gray-300 -mt-1">
              Built to Fly, Engineered to Protect
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}


export default Header;
