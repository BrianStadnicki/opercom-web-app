<script lang="ts">
    function handleSubmit(e) {
        let tokens = <string[]>JSON.parse(e.target.elements["tokens"].value);
        localStorage.setItem("skype-token", tokens['skype']);
        localStorage.setItem("auth-token", tokens['token']);
        localStorage.setItem("email", tokens['email']);
    }
</script>

<div id="enter-credentials-form" on:submit={handleSubmit}>
    <form>
        <div>
            <p></p>
            <div>
                <p>Open the console in Teams and paste in the following:</p>
                <code>
                    document&period;body&period;innerHTML &equals; &grave;Copy and paste the following into OperCom&colon;&lt;br&gt;&lt;span&gt;&dollar;&lcub;JSON&period;stringify&lpar;&lcub;&apos;skype&apos;&colon;document&period;cookie&period;split&lpar;&apos;&semi; &apos;&rpar;&period;find&lpar;&lpar;row&rpar; &equals;&gt; row&period;startsWith&lpar;&apos;skypetoken&lowbar;asm&equals;&apos;&rpar;&rpar;&quest;&period;split&lpar;&apos;&equals;&apos;&rpar;&lsqb;1&rsqb;&comma;&apos;token&apos;&colon;&apos;Bearer &apos;&plus;JSON&period;parse&lpar;localStorage&period;getItem&lpar;Object&period;keys&lpar;localStorage&rpar;&period;filter&lpar;key &equals;&gt; key&period;startsWith&lpar;&quot;ts&period;&quot;&rpar; &amp;&amp; key&period;endsWith&lpar;&quot;https&colon;&sol;&sol;api&period;spaces&period;skype&period;com&quot;&rpar;&rpar;&rpar;&rpar;&period;token&comma;&apos;email&apos;&colon;JSON&period;parse&lpar;localStorage&period;getItem&lpar;&apos;ts&period;userInfo&apos;&rpar;&rpar;&lsqb;&apos;email&apos;&rsqb;&rcub;&rpar;&rcub;&lt;&sol;span&gt;&grave;&semi;&NewLine;                    </code>
                <p>Paste the result below</p>
            </div>
        </div>
        <div>
            <label for="tokens">Tokens</label>
            <textarea type="text" id="tokens"></textarea>
        </div>
        <button type="submit">Save</button>
    </form>
</div>

<style lang="scss">
  #enter-credentials-form {
    display: grid;
    row-gap: 10px;

    border: black solid;
    border-radius: 10px;
    padding: 10px;
    margin: 15px;

    form {
        div {
            display: grid;
            grid-template-columns: 100px auto;
            margin: 10px;
            padding: 10px;
            border: blue solid;
            border-radius: 10px;

            div {
                display: initial;
                border: initial;
                word-break: break-word;
                box-sizing: border-box;
            }
        }

        button {
            margin: 10px;
        }
    }
  }

  textarea {
    height: 100px;
    resize: vertical;
  }
</style>
