import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../my-context";
import LoadingDialog from "../components/loading/LoadingDialog";


interface CartData {
  id: string;
  name: string;
  type: 1 | 2;
  available: boolean;
}

const Checkout: React.FC = () => {

  const context = useAuthContext();
  const navigate = useNavigate();

  const [cartData, setCartData] = useState<CartData[]>([]);
  const [cartDataLoading, setCartDataLoading] = useState<boolean>(false);

  const fetchCarts = useCallback(async () => {
    try {
      setCartDataLoading(true);
      const res = await fetch('/cart-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!res.ok) {
        console.log(res.statusText);
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data: CartData[] | null = await res.json();
      console.log(data);
      if (!data || data.length <= 0) {
        throw new Error(`Error fetching cart data`);
      }
      setCartData(data);
      setCartDataLoading(false);
    } catch (err: any) {
      setCartDataLoading(false);
      console.error("Error while verifying token:", err);
    }
  }, []);

  useEffect(() => {
    if (!context.authLoading) {
      if (!context.auth.loggedIn) {
        console.log('checkout page - not logged in')
        navigate('/login', { replace: true });
      } else {
        console.log('checkout page - fetching carts')
        fetchCarts();
      }
    }
  }, [context.authLoading, context.auth, fetchCarts]);

  return (
    <>
      <h1>Checking out carts</h1>
      <LoadingDialog loadingMessage={"Loading Cart Info..."} isLoading={cartDataLoading} />

      {/* {context.authError &&
        <ErrorDialog />
      } */}

      <ul>
        {cartData.map((cart: CartData, idx: number) => {
          return (
            <li>
              Cart#{idx}: {cart.name} - {cart.type === 1 ? "4-seater" : "6-seater"} - {cart.available ? "Available" : "Not Available"}
            </li>
          )
        })
        }
      </ul>
    </>
  );
};

export default Checkout;

