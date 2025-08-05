import InputForm from "./components/InputForm"
import SummaryCard from "./components/SummaryCard"

function App() {

  return (
    <>
      <h1>thread summarizer</h1>
      <InputForm onSubmit={() => {}} isLoading={false} />
      {/* <SummaryCard summary={null} onNewSummary={() => {}} /> */}
    </>
  )
}

export default App
