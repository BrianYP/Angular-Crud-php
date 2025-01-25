import { NgModule } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class HttpClientModuleConfig {}
