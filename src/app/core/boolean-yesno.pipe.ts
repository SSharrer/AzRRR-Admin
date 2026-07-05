import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'booleanToYesNo',
  standalone: true
})
export class BooleanToYesNoPipe implements PipeTransform {
  transform(value: any): any {
    return (value) ? 'Yes' : 'No';
  }
}