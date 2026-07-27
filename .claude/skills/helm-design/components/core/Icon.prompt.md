The instrument glyph set. Every icon in Helm comes from here — no Lucide, no emoji, no unicode glyphs.

```jsx
<Icon name="anchor" size={15} />
<span style={{color:'var(--drift)'}}><Icon name="bearing-off" /></span>
<a href="…">Open decision note <Icon name="provenance" size={12} /></a>
```

Icons take `currentColor` and are never filled. Six are load-bearing and may not be used decoratively: `anchor`, `helm-mark`, `bearing-off`, `shackle`, `sounding`, `beacon`. `bearing-off` is the only glyph allowed to carry brass. `provenance` is mandatory on every link that leaves Helm. The same set ships as standalone files in `assets/icons/`.
