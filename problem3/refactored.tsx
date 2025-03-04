interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // added blockchain property
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

class Datasource {
  // TODO: Implement datasource class
  // add code to fetch from url
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async getPrices(): Promise<{ [key: string]: number }> {
    const response = await fetch(this.url);
    if (!response.ok) {
      throw new Error("Failed to fetch prices");
    }
    return response.json();
  }
}

interface Props extends BoxProps {}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const [prices, setPrices] = useState<{ [key: string]: number }>({}); // define the type of prices
  // added new state for loading
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const datasource = new Datasource(
      "https://interview.switcheo.com/prices.json"
    );
    datasource
      .getPrices()
      .then((prices) => {
        setPrices(prices);
        // update loading state
        setLoading(false);
      })
      .catch((error) => {
        console.error(error); // console.error
        // update loading state
        setLoading(false);
      });
  }, []);

  const getPriority = (blockchain: string): number => {
    // blockchain should be string type
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
        return 20;
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        return balancePriority > -99 && balance.amount > 0; // updated variable
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        return rightPriority - leftPriority; // simplified sorting
      });
  }, [balances]); // removed prices which may cause unnecessary renders if its not called

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => ({
    ...balance,
    formatted: balance.amount.toFixed(2), // specify decimal places
  }));

  const rows = formattedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency]
        ? prices[balance.currency] * balance.amount
        : 0; // handle potential NaN
      return (
        <WalletRow
          className={classes.row}
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    }
  );
  return <div {...rest}>{rows}</div>;
};
