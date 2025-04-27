Error: ./app/globals.css:113:3
[31m[1mSyntax error[22m[39m: C:\Users\baudi\OneDrive\Desktop\CalmHour\calmhour-landing\app\globals.css The `bg-background` class does not exist. If `bg-background` is a custom class, make sure it is defined within a `@layer` directive.

 [90m 111 | [39m[90m/* Apply base body styles AFTER variables are defined */[39m
 [90m 112 | [39mbody [33m{[39m
[1m[31m>[39m[22m[90m 113 | [39m  [36m@apply[39m bg-background text-foreground[33m;[39m 
 [90m     | [39m  [1m[31m^[39m[22m
 [90m 114 | [39m[33m}[39m
 [90m 115 | [39m
    at BuildError (webpack-internal:///(pages-dir-browser)/./node_modules/next/dist/client/components/react-dev-overlay/ui/container/build-error.js:43:41)
    at renderWithHooks (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom.development.js:15486:18)
    at updateFunctionComponent (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom.development.js:19612:20)
    at beginWork (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom.development.js:21635:16)
    at beginWork$1 (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom.development.js:27460:14)
    at performUnitOfWork (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom.development.js:26591:12)
    at workLoopSync (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom.development.js:26500:5)
    at renderRootSync (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom.development.js:26468:7)
    at performConcurrentWorkOnRoot (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom.development.js:25772:74)
    at workLoop (webpack-internal:///(pages-dir-browser)/./node_modules/scheduler/cjs/scheduler.development.js:266:34)
    at flushWork (webpack-internal:///(pages-dir-browser)/./node_modules/scheduler/cjs/scheduler.development.js:239:14)
    at MessagePort.performWorkUntilDeadline (webpack-internal:///(pages-dir-browser)/./node_modules/scheduler/cjs/scheduler.development.js:533:21)
   
/app/globals.css (113:3)

Syntax error: C:\Users\baudi\OneDrive\Desktop\CalmHour\calmhour-landing\app\globals.css The `bg-background` class does not exist. If `bg-background` is a custom class, make sure it is defined within a `@layer` directive.

  111 | /* Apply base body styles AFTER variables are defined */
  112 | body {
> 113 |   @apply bg-background text-foreground; 
      |   ^
  114 | }
  115 | 