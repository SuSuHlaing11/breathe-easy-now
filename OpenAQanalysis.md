# OpenAQ Trend Methods

This document explains how the four OpenAQ trend methods are calculated for each year.

## Common Filters
All methods share the same filters before aggregation:
- `year_from` to `year_to`
- `pollutant` (exact match, e.g., `PM2.5`)
- `country_name` (case-insensitive exact match after normalization)
- `metric` (one of `value`, `avg`, `min`, `max`, `median`)

Unless noted otherwise, values are taken from the selected `metric` field for each station.

## Methods

### 1. Weighted (coverage-weighted mean)
Uses only stations with `coverage_percent >= 50`.

For each year:
```
numerator   = Σ(metric_value * coverage_percent)
denominator = Σ(coverage_percent)
value       = numerator / denominator   (if denominator > 0, else null)
```

### 2. Unweighted (simple mean)
Uses only stations with `coverage_percent >= 50`.

For each year:
```
value = average(metric_value)
```

### 3. Balanced Panel (stable station set)
Uses only stations that appear in *all* years in the selected range, with `coverage_percent >= 50`.

Steps:
1. Find station IDs that have data for every year in `[year_from, year_to]`.
2. Compute the mean over that fixed station set:
```
value = average(metric_value) over balanced stations
```

### 4. Median
Uses all stations that match the filters (no coverage threshold), and returns the median.

For each year:
```
value = median(metric_value)
```

## Notes
- If there is no data for a year, the value is `null`.
- Weighted and Unweighted methods both enforce `coverage_percent >= 50`.
- Balanced Panel may return fewer years if no station meets the “all years” requirement.
