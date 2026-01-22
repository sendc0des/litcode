import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css'; 

export default defineContentScript({
  matches: ['*://leetcode.com/problems/*'],
  cssInjectionMode: 'ui', 
  
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'litcode-sidebar',
      position: 'inline',
      onMount: (container) => {
        // Create a root and render our App
        const root = ReactDOM.createRoot(container);
        root.render(<App />);
        return root;
      },
    });

    // Mount the UI to the DOM
    ui.mount();
  },
});