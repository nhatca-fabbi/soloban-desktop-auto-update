window.addEventListener('load', function () {
  let interval: any = setInterval(function () {
    const loadingScreenDone = document.querySelector('body.loadingscreendone');
    if (!loadingScreenDone) {
      window.navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          const length = registrations.length;
          for (let registration of registrations) {
            registration.unregister();
          }
          if (length) {
            window.location.reload();
          }
        });
    }

    if (loadingScreenDone) {
      clearInterval(interval);
      interval = undefined;
    }
  }, 1000);
});

export {};
