import Marketplace from "./Pages/Marketplace/Marketplace";
import ItemDetails from "./Pages/ItemDetails/ItemDetails";
import MyGotChis from "./Pages/MyGotChis/MyGotChis";
import Mint from "./Pages/Mint/Mint";
import LoadingOverlay from 'react-loading-overlay';

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navigation from "./Components/Navigation/Navigation";
import { useSelector } from "react-redux"
import MyPacks from "./Pages/MyPacks/MyPacks";
import MyGotChiDetails from "./Pages/MyGotChiDetails/MyGotChiDetails";
import MyItems from "./Pages/MyItems/MyItems";
import MyGotChiItemDetails from "./Pages/MyGotChiItemDetails/MyGotChiItemDetails";
import MyPackItemDetails from "./Pages/MyPackItemDetails/MyPackItemDetails";
import MyPackDetails from "./Pages/MyPackDetails/MyPackDetails";
import { ToastContainer } from "react-toastify"
import "./App.css";

function App() {

  const isLoading = useSelector(state => state.global.isLoading);
  const loadingLabel = useSelector(state => state.global.loadingLabel);

  return (
    <LoadingOverlay
      active={isLoading}
      spinner
      text={ loadingLabel }
      styles={{
        wrapper: {
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        },
      }}>
        <ToastContainer/>
          <BrowserRouter>
      
            <div className="App">
              <div className="container">
                <Navigation></Navigation>
                <Routes>
                  <Route path="/" element={<Marketplace/>}/>
                  <Route path="/item-list/:type" element={<Marketplace/>}/>
                  <Route path="/item-details/:type/:id" element={<ItemDetails/>}/>
                  <Route path="/my-gotchis" element={<MyGotChis/>}/>
                  <Route path="/my-gotchi-details/:id" element={<MyGotChiDetails/>}/>
                  <Route path="/my-gotchi-item-details/:id" element={<MyGotChiItemDetails/>}/>
                  <Route path="/my-pack-item-details/:id" element={<MyPackItemDetails/>}/>
                  <Route path="/my-pack-details/:id" element={<MyPackDetails/>}/>
                  <Route path="/my-packs" element={<MyPacks/>}/>
                  <Route path="/my-items" element={<MyItems/>}/>
                  <Route path="/mint" element={<Mint/>}/>
                </Routes>
              </div>
            </div>
          </BrowserRouter>
        {/* </ToastContainer> */}
      
    </LoadingOverlay>
  );
}

export default App;
