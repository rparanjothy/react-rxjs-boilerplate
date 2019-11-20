import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Observable, of, BehaviorSubject, Subscription, from } from "rxjs";
import { map, filter, delay, mergeMap, debounceTime } from "rxjs/operators";
import axios from "axios";
const a$ = from([1, 2, 3, 4, 5]);

const search$ = new BehaviorSubject();
const searchPipe$ = search$.pipe(
  map(x => x),
  debounceTime(250),
  mergeMap(x => from(getPoke(x)))
);

let helloadded$ = a$.pipe(
  filter(e => e < 5),
  mergeMap(e => of(e).pipe(delay(e * 300))),
  map(x => "Hello " + x)
);

// const getBIOS = async x => {
//   var o = [];
//   for (let i = 0; i < x; i++) {
//     o.push({ a: i });
//   }
//   return o.filter(x => true);
// };

const getPoke = async x => {
  const resp = await axios
    .get("https://pokeapi.co/api/v2/pokemon/?limit=100")
    .then(x => x.data.results);
  // console.log(resp);
  return resp.filter(_ => _.name.includes(x));
};

const useObservable = (obs$, setter) => {
  useEffect(() => {
    const mysub = obs$.subscribe(x => {
      setter(x);
      console.log(x);
    });
    return () => mysub.unsubscribe();
  }, [obs$, setter]);
};

function App() {
  const [x, setX] = useState(1212);
  const [search, setSearch] = useState("ram");
  const [results, setResults] = useState([]);

  useObservable(helloadded$, setX);
  // useObservable(search$, setSearch);
  useObservable(searchPipe$, setResults);

  return (
    <div className="App">
      <div>{x}</div>
      <input
        type="text"
        onChange={e => {
          setSearch(e.target.value);
          search$.next(e.target.value);
        }}
        value={search}
      ></input>
      <hr></hr>
      <ul>
        {results.map(x => (
          <li>
            {x.name} : {x.url}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
