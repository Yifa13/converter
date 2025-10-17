import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, map, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  temperatureForm: FormGroup;
  convertedTemperature$ = new BehaviorSubject<number | null>(null);
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
    this.temperatureForm = this.fb.group({
      temperature: [0],
      unit: ['celsius']
    });
  }

  ngOnInit() {
    combineLatest([
      this.temperatureForm.get('temperature')!.valueChanges,
      this.temperatureForm.get('unit')!.valueChanges
    ]).pipe(
      takeUntil(this.destroy$),
      map(([temp, unit]) => {
        const numTemp = parseFloat(temp) || 0;
        if (unit === 'celsius') {
          return (numTemp * 9/5) + 32; // Celsius to Fahrenheit
        } else {
          return (numTemp - 32) * 5/9; // Fahrenheit to Celsius
        }
      })
    ).subscribe(converted => {
      this.convertedTemperature$.next(converted);
    });

    // Trigger initial calculation
    this.temperatureForm.get('temperature')!.setValue(0);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
