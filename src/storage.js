// store.js
import { writable } from 'svelte/store';

const createWritableStore = (key, startValue) => {
  const { subscribe, set } = writable(startValue);
  
	return {
    subscribe,
    set,
    useLocalStorage: () => {
        if(typeof window !== "undefined") {
            const json = localStorage.getItem(key);
            if (json) {
                set(JSON.parse(json));
            }
            
            subscribe(current => {
                localStorage.setItem(key, JSON.stringify(current));
            });
        } 
        // else {
        //     console.log("^^^^^^^^^^^^^^^^^^^^");
        // }
    }
  };
}

export const mysession = createWritableStore('mysession', {});