# minclude
hinclude with merged request

Work in progress, some hinclude functionnalities might be missing.

## How to use

```html
<html xmlns:hx="http://purl.org/NET/hinclude">
    <head>
      <script src="/lib/minclude.js" type="text/javascript"></script>
  …
```

Then,

```html
<!-- Single entry -->
<hx:include src="/other/document/here.html"></hx:include>

<!-- Merged entries -->
<hx:include entry="inbox" src="/api/user.json"></hx:include>
<hx:include entry="profile" src="/api/user.json">
    <img src="default_picture.png" alt="Avatar" />
</hx:include>
```

### Event

```js
document.getElementById('my-element').addEventListener('hinclude', function(ev) {
    // Do whatever you want when it's loaded, like removing a loading class
    // Or manipulating XHR Response with `ev.detail.data`
});
```
