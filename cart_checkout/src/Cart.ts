

/**
 * @function logout
 * @description Logs user out of the application by setting the HttpOnly jwtToken cookie to an empty string.
 * 
 * @returns {boolean} true if logout operation was successful, otherwise false
 */
export const logout = async (): Promise<boolean> => {
  try {
    const res = await fetch('/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      alert(res.statusText);
      console.error(`Server responded with status: ${res.status}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Something went wrong when logging out:", err);
    alert("Something went wrong when logging out!");
    return false;
  }
};


/**
 * @function timeout
 * @description sets a timeout for a specified duration (in ms)
 * 
 * @param {number} delay the amount of time to wait in ms
 * @returns {Promise<unknown>}
 */
export function timeout(delay: number): Promise<unknown> {
  return new Promise((res) => setTimeout(res, delay));
}