<script lang="ts">
  export let label = "Click me";
  export let onClick: () => void = () => {};
</script>

<button on:click={onClick} class="btn">
  {label}
</button>

<style>
  .btn {
    padding: 0.5rem 1rem;
    background-color: #0066cc;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
