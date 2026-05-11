const contexts = new WeakMap();

class LoadingSpinner {
  constructor() {
    contexts.set(this, {
      spinner: {
        showCount: 0,
        show: false
      }
    });
  }

  get spinner() {
    return contexts.get(this).spinner;
  }

  /**
   * Hide Spinner
   */
  hide() {
    const spinnerContext = contexts.get(this).spinner;

    if (spinnerContext.showCount > 0) {
      spinnerContext.showCount--;

      if (spinnerContext.showCount === 0) {
        spinnerContext.show = false;
      }
    }
  }

  /**
   * Show spinner
   */
  show() {
    const spinnerContext = contexts.get(this).spinner;

    spinnerContext.showCount++;
    spinnerContext.show = true;
  }
}

export default new LoadingSpinner();
