import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { afterEach } from "vitest";

import { baseApi } from "@/app/api";
import { AppRoutes } from "@/app/routes/AppRoutes";
import { createAppStore, type AppStore } from "@/app/store";

const stores = new Set<AppStore>();
afterEach(() => {
  stores.forEach((store) => store.dispatch(baseApi.util.resetApiState()));
  stores.clear();
});

export function renderApp(path = "/") {
  const store = createAppStore();
  stores.add(store);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </Provider>,
  );
}
